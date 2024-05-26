const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createUser = async (userData) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  const result = await pool.query(
    "INSERT INTO users (username, password, name, office, nid_number, email, phone, photo, role, is_verified, otp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
      userData.username,
      hashedPassword,
      userData.name,
      userData.office,
      userData.nid_number,
      userData.email,
      userData.phone,
      userData.photo,
      userData.role,
      userData.is_verified,
      userData.otp,
    ]
  );
  return result.rows[0];
};

const findUserByUsername = async (username) => {
  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};

const findUserByPhone = async (phone) => {
  const result = await pool.query("SELECT * FROM users WHERE phone = $1", [
    phone,
  ]);
  return result.rows[0];
};

const updateUserOtp = async (email, otp) => {
  await pool.query("UPDATE users SET otp = $1 WHERE email = $2", [otp, email]);
};

const verifyUser = async (email) => {
  await pool.query("UPDATE users SET is_verified = TRUE WHERE email = $1", [
    email,
  ]);
};

module.exports = {
  createUser,
  findUserByUsername,
  findUserByEmail,
  findUserByPhone,
  updateUserOtp,
  verifyUser,
};
