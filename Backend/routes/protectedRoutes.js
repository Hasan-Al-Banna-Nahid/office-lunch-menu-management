const express = require("express");
const { authenticateToken, authorizeRoles } = require("../middlewares/auth");
const router = express.Router();

// Example of a protected route
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.send("Hello Admin");
});

// Example of a user-only route
router.get(
  "/user",
  authenticateToken,
  authorizeRoles("user", "admin"),
  (req, res) => {
    res.send("Hello User");
  }
);

module.exports = router;
