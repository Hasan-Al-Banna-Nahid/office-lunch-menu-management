const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./config/database");
const menuRoutes = require("./routes/menuRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1", menuRoutes);
app.use("/api/v1", userRoutes);

sequelize.sync().then(() => {
  app.get("/", (req, res) => {
    res.send("Welcome To RoeBenDev's Lunch Menu");
  });
  console.log("Database connected!");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server is running on port ${process.env.PORT || 5000}`);
  });
});
