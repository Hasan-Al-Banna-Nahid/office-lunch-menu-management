module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define("Menu", {
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    items: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  });

  Menu.associate = (models) => {
    Menu.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Menu;
};
