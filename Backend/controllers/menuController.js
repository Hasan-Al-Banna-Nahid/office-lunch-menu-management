const db = require("../config/database");

exports.createMenu = async (req, res) => {
  try {
    const { date, items } = req.body;

    // Check if date is provided and convert it to the correct format
    if (!date || !items) {
      return res
        .status(400)
        .json({
          error: "Make Sure All Required Key Is Fulfilled With Correct Format",
        });
    }

    // Parse date from the format 'DD/MM/YYYY' to 'YYYY-MM-DD'
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    // Validate the date format
    if (isNaN(new Date(formattedDate).getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const result = await db.query(
      "INSERT INTO menus (date, items) VALUES ($1, $2) RETURNING *",
      [formattedDate, items]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Other controller methods

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
