const express = require("express");
const router = express.Router();

// routes/auth.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const { body, validationResult } = require("express-validator");
const upload = require("../config/multer");
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

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
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send verification email
const sendVerificationEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification",
    text: `Your verification code is: ${otp}`,
  };
  transporter.sendMail(mailOptions);
};

// Send OTP to phone
const sendOtpToPhone = (phone, otp) => {
  client.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
};

// Generate OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
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

      const createUserQuery = `
      INSERT INTO users (username, password, name, office, nid_number, email, phone, photo, role, is_verified, otp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
        role,
        false,
        otp,
      ]);

      client.release();

      sendVerificationEmail(email, otp);
      sendOtpToPhone(phone, otp);

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

module.exports = router;
