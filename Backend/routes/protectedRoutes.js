// routes/protected.js
const express = require("express");
const router = express.Router();
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");

router.get(
  "/protected",
  authenticateToken,
  authorizeRoles("admin", "user"),
  (req, res) => {
    res.json({ message: "Protected route", user: req.user });
  }
);

module.exports = router;
