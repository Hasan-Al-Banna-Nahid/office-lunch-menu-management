const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./user");
const Menu = require("./menu");

const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Menu: Menu(sequelize, Sequelize.DataTypes),
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
