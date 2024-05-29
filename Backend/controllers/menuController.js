const db = require("../config/database");

exports.createMenu = async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Only admins can create menus." });
    }

    const { date, items } = req.body;

    // Check if date is provided
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    // Convert date from 'DD/MM/YYYY' to 'YYYY-MM-DD'
    const [day, month, year] = date.split("/");
    const formattedDate = `${year}-${month}-${day}`;

    // Validate date format
    if (isNaN(new Date(formattedDate).getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Check if items are provided
    if (!items || typeof items !== "object") {
      return res.status(400).json({ error: "Items object is required" });
    }

    // Insert the data into the database
    const query = "INSERT INTO menus (date, items) VALUES ($1, $2) RETURNING *";
    const values = [formattedDate, JSON.stringify(items)];

    const result = await db.query(query, values);
    const menu = result.rows[0];

    res.status(201).json(menu);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.chooseFood = async (req, res) => {
  try {
    const { menu_id, choices } = req.body;

    console.log("Request body:", req.body); // Debug: Log the incoming request body

    // Validate menu_id and choices
    if (!menu_id || !Array.isArray(choices) || choices.length === 0) {
      return res.status(400).json({
        error:
          "menu_id and choices are required, and choices must be a non-empty array",
      });
    }

    const userId = req.user.userId; // Correcting this line to match the actual property name

    console.log("User ID:", userId); // Debug: Log the user ID

    // Database query to insert or update the employee choices
    const query = `
      INSERT INTO employee_choices (user_id, menu_id, choices)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, menu_id)
      DO UPDATE SET choices = EXCLUDED.choices
      RETURNING *;
    `;
    const values = [userId, menu_id, JSON.stringify(choices)];
    const result = await db.query(query, values);
    const choice = result.rows[0];

    res.status(201).json(choice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

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

exports.searchMenus = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res
        .status(400)
        .json({ error: "Query parameter 'query' is required" });
    }

    // Log the search query for debugging
    console.log("Search query:", query);

    // Construct the SQL query to search for menus
    const searchQuery = `
    SELECT *
    FROM menus
    WHERE LOWER(items::text) LIKE LOWER($1)
      OR date::text LIKE $1;
    `;

    // Log the SQL query for debugging
    console.log("SQL query:", searchQuery);

    // Execute the SQL query
    const result = await db.query(searchQuery, [`%${query.toLowerCase()}%`]);
    const matchedMenus = result.rows;

    // Log the matched menus for debugging
    console.log("Matched menus:", matchedMenus);

    res.status(200).json(matchedMenus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenuPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateType, date, items } = req.body;

    // Check if updateType is provided
    // if (!updateType) {
    //   return res.status(400).json({ error: "Update type is required" });
    // }

    if (updateType === "date") {
      // Check if date is provided
      if (!date) {
        return res
          .status(400)
          .json({ error: "Date is required for updating date" });
      }

      // Convert date format from 'DD/MM/YYYY' to 'YYYY-MM-DD'
      const [day, month, year] = date.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      // Validate the formatted date
      if (isNaN(new Date(formattedDate).getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Update date
      const updateQuery = `
        UPDATE menus
        SET date = $1
        WHERE id = $2
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [formattedDate, id]);
      const updatedMenu = result.rows[0];
      if (!updatedMenu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      res.status(200).json(updatedMenu);
    } else if (updateType === "items") {
      // Check if items are provided
      if (!items) {
        return res
          .status(400)
          .json({ error: "Items are required for updating items" });
      }

      // Update items
      const updateQuery = `
        UPDATE menus
        SET items = $1
        WHERE id = $2
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [items, id]);
      const updatedMenu = result.rows[0];
      if (!updatedMenu) {
        return res.status(404).json({ error: "Menu not found" });
      }
      res.status(200).json(updatedMenu);
    } else {
      return res.status(400).json({ error: "Invalid update type" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateType, items } = req.body;

    // Fetch the current menu from the database
    const menuResult = await db.query("SELECT * FROM menus WHERE id = $1", [
      id,
    ]);
    const currentMenu = menuResult.rows[0];

    if (!currentMenu) {
      return res.status(404).json({ error: "Menu not found" });
    }

    if (updateType === "items") {
      // Check if items object is provided
      if (!items || typeof items !== "object") {
        return res
          .status(400)
          .json({ error: "Items object is required for updating items" });
      }

      // Parse current items as JSON
      const currentItems = JSON.parse(currentMenu.items);

      // Update the specified categories in the current items
      for (const category in items) {
        if (items[category]) {
          currentItems[category] = items[category];
        }
      }

      // Convert updated items back to string for storage
      const updatedItemsString = JSON.stringify(currentItems);

      // Update items while keeping existing date
      const updateQuery = `
        UPDATE menus
        SET items = $1
        WHERE id = $2
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [updatedItemsString, id]);
      const updatedMenu = result.rows[0];
      updatedMenu.items = JSON.parse(updatedMenu.items); // Ensure items are parsed

      return res.status(200).json(updatedMenu);
    } else {
      return res.status(400).json({ error: "Invalid update type" });
    }
  } catch (error) {
    console.error(error);
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
exports.getEmployeeMenuChoices = async (req, res) => {
  try {
    const { menu_id } = req.params;

    // Check if the current user is an admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Unauthorized: Access is limited to administrators." });
    }

    // Query to get employee details, their choices, and the menu date for a specific menu
    const query = `
      SELECT u.id, u.name, u.email, ec.choices, m.date
      FROM users u
      JOIN employee_choices ec ON u.id = ec.user_id
      JOIN menus m ON ec.menu_id = m.id
      WHERE ec.menu_id = $1;
    `;
    const values = [menu_id];
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "No employee choices found for this menu." });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
