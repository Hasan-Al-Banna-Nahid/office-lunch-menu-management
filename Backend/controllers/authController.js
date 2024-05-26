const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const twilio = require("twilio");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { body, validationResult } = require("express-validator");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const authenticate = require("../middlewares/auth");
require("dotenv").config();

const router = express.Router();

// Configure PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Configure Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send verification email
const sendVerificationEmail = (email, otp) => {
  const verificationUrl = `http://localhost:5000/verify?email=${encodeURIComponent(
    email
  )}&otp=${encodeURIComponent(otp)}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    html: `Please click on the link to verify your email: <a href="${verificationUrl}">Verify Email</a>`,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending verification email:", error);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
};

// Send OTP to phone
const sendOtpToPhone = (phone, otp) => {
  twilioClient.messages
    .create({
      body: `Your OTP code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    .then((message) => console.log("OTP sent: ", message.sid))
    .catch((error) => console.error("Error sending OTP: ", error));
};

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // This generates a 6-digit OTP
};

// Validation rules
const registerValidationRules = () => {
  return [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("office").notEmpty().withMessage("Office is required"),
    body("nid_number").notEmpty().withMessage("NID number is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("otp")
      .isLength({ max: 6 })
      .withMessage("OTP must be at most 6 characters long"),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Register route
router.post(
  "/register",
  upload.single("photo"),
  registerValidationRules(),
  validate,
  async (req, res) => {
    const { username, password, name, office, nid_number, email, phone, role } =
      req.body;
    const photo = req.file ? req.file.path : null;

    if (
      !username ||
      !password ||
      !name ||
      !office ||
      !nid_number ||
      !email ||
      !phone
    ) {
      return res
        .status(400)
        .json({ error: "Make sure all required fields are filled." });
    }

    try {
      const client = await pool.connect();

      const existingUserByEmailQuery = "SELECT * FROM users WHERE email = $1";
      const existingUserByPhoneQuery = "SELECT * FROM users WHERE phone = $1";

      const existingUserByEmail = await client.query(existingUserByEmailQuery, [
        email,
      ]);
      const existingUserByPhone = await client.query(existingUserByPhoneQuery, [
        phone,
      ]);

      if (existingUserByEmail.rows.length > 0) {
        client.release();
        return res.status(400).json({ error: "Email already exists" });
      }

      if (existingUserByPhone.rows.length > 0) {
        client.release();
        return res.status(400).json({ error: "Phone number already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const otp = generateOtp();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      const createUserQuery = `
      INSERT INTO users (username, password, name, office, nid_number, email, phone, photo, role, is_verified, otp, otp_expiry)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`;
      const newUser = await client.query(createUserQuery, [
        username,
        hashedPassword,
        name,
        office,
        nid_number,
        email,
        phone,
        photo,
        role || "user",
        false,
        otp,
        otpExpiry,
      ]);

      client.release();

      sendVerificationEmail(email, otp);
      // sendOtpToPhone(phone, otp);

      res.status(201).json({
        message: "User registered. Verification email and OTP sent.",
        user: newUser.rows[0],
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// OTP verification route
router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const client = await pool.connect();

    const getUserQuery = "SELECT * FROM users WHERE email = $1 AND otp = $2";
    const result = await client.query(getUserQuery, [email, otp]);

    if (result.rows.length === 0) {
      client.release();
      return res.status(400).json({ error: "Invalid OTP or email" });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.otp_expiry)) {
      const deleteUserQuery = "DELETE FROM users WHERE id = $1";
      await client.query(deleteUserQuery, [user.id]);

      client.release();

      sendVerificationEmail(
        user.email,
        "Your registration failed due to expired OTP."
      );
      // sendOtpToPhone(
      //   user.phone,
      //   "Your registration failed due to expired OTP."
      // );

      return res
        .status(400)
        .json({ error: "OTP has expired. Registration failed." });
    }

    const updateUserQuery = "UPDATE users SET is_verified = $1 WHERE id = $2";
    await client.query(updateUserQuery, [true, user.id]);

    client.release();

    res.status(200).json({ message: "User verified successfully." });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ error: error.message });
  }
});
cron.schedule("*/5 * * * *", async () => {
  try {
    const client = await pool.connect();

    const now = new Date();
    const deleteQuery =
      "DELETE FROM users WHERE is_verified = false AND otp_expiry < $1 RETURNING *";
    const result = await client.query(deleteQuery, [now]);

    client.release();

    result.rows.forEach((user) => {
      sendVerificationEmail(
        user.email,
        "Your registration failed due to expired OTP."
      );
      sendOtpToPhone(
        user.phone,
        "Your registration failed due to expired OTP."
      );
    });

    console.log(`Deleted ${result.rows.length} unverified users.`);
  } catch (error) {
    console.error("Error during scheduled task:", error);
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      client.release();
      return res.status(401).json({ error: "Email is not registered" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      client.release();
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    client.release();
    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
