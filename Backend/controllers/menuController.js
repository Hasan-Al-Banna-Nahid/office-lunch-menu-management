const db = require("../config/database");

exports.createMenu = async (req, res) => {
  try {
    const { date, starters, mainMenu, desserts, drinks } = req.body;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({
        error: "Date is required",
      });
    }

    // Parse date from the format 'DD/MM/YYYY' to 'YYYY-MM-DD'
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    // Validate the date format
    if (isNaN(new Date(formattedDate).getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Construct the items object
    const items = {
      starters: Array.isArray(starters) ? starters : [],
      mainMenu: Array.isArray(mainMenu) ? mainMenu : [],
      desserts: Array.isArray(desserts) ? desserts : [],
      drinks: Array.isArray(drinks) ? drinks : [],
    };

    // Check if at least one category has items
    if (
      !items.starters.length &&
      !items.mainMenu.length &&
      !items.desserts.length &&
      !items.drinks.length
    ) {
      return res
        .status(400)
        .json({ error: "At least one item in a category is required" });
    }

    // Insert the data into the database
    const query = "INSERT INTO menus (date, items) VALUES ($1, $2) RETURNING *";
    const values = [formattedDate, items]; // Directly use the items object

    const result = await db.query(query, values);
    const menu = result.rows[0];

    res.status(201).json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Other controller methods

exports.getMenus = async (req, res) => {
  try {
    const query = "SELECT * FROM menus";
    const result = await db.query(query);
    const menus = result.rows;
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
    const { id } = req.params;

    // Validate the provided ID
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }

    // Perform the delete operation
    const result = await db.query(
      "DELETE FROM menus WHERE id = $1 RETURNING *",
      [id]
    );

    // Check if the menu was found and deleted
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Menu not found" });
    }

    // Return the deleted menu
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
