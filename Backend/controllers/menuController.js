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
     OR date::text LIKE $1
   OR date::text = $1;0
    
    `;

    // Log the SQL query for debugging
    console.log("SQL query:", searchQuery);

    // Execute the SQL query
    const result = await db.query(searchQuery, [`%${query.toLowerCase()}%`]);
    const matchedMenus = result.rows;
    res.status(200).json(matchedMenus);
    console.log("Matched menus:", matchedMenus);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// exports.getMenuById = async (req, res) => {
//   try {
//     const menu = await Menu.findByPk(req.params.id);
//     if (menu) {
//       res.status(200).json(menu);
//     } else {
//       res.status(404).json({ error: "Menu not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.updateMenuPrompt = async (req, res) => {
  try {
    const { id } = req.params;
    const { updateType, date, items } = req.body;

    // Check if updateType is provided
    if (!updateType) {
      return res.status(400).json({ error: "Update type is required" });
    }

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
    const { updateType, date, items, category } = req.body;

    // Fetch the current menu from the database
    const menuResult = await db.query("SELECT * FROM menus WHERE id = $1", [
      id,
    ]);
    const currentMenu = menuResult.rows[0];

    if (!currentMenu) {
      return res.status(404).json({ error: "Menu not found" });
    }

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

      // Update date while keeping existing items
      const updateQuery = `
        UPDATE menus
        SET date = $1
        WHERE id = $2
        RETURNING *;
      `;
      const result = await db.query(updateQuery, [formattedDate, id]);
      const updatedMenu = result.rows[0];
      updatedMenu.items = JSON.parse(updatedMenu.items); // Ensure items are parsed
      return res.status(200).json(updatedMenu);
    } else if (updateType === "items") {
      // Check if items and category are provided
      if (!items || !category) {
        return res
          .status(400)
          .json({
            error: "Items and category are required for updating items",
          });
      }

      // Parse current items as JSON
      const currentItems = JSON.parse(currentMenu.items);

      // Update the specified category with the new items
      currentItems[category] = items;

      // Convert merged items back to string for storage
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
