const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");
const db = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", menuRoutes);
app.use("/api/v1", userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome To RoeBenDev's Lunch Menu");
});
app.get("/test-db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json(result.rows);
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection error" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
