const { Menu } = require("../models/menu");

exports.createMenu = async (req, res) => {
  try {
    const { date, items } = req.body;
    const menu = await Menu.create({ date, items });
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll();
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMenuById = async (req, res) => {
  try {
    const menu = await Menu.findByPk(req.params.id);
    if (menu) {
      res.status(200).json(menu);
    } else {
      res.status(404).json({ error: "Menu not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { date, items } = req.body;
    const [updated] = await Menu.update(
      { date, items },
      {
        where: { id: req.params.id },
      }
    );
    if (updated) {
      const updatedMenu = await Menu.findByPk(req.params.id);
      res.status(200).json(updatedMenu);
    } else {
      res.status(404).json({ error: "Menu not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const deleted = await Menu.destroy({
      where: { id: req.params.id },
    });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Menu not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
