const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");

router.post("/menus", menuController.createMenu);
router.get("/menus", menuController.getMenus);
router.get("/menus/search", menuController.searchMenus);
router.put("/menus/:id", menuController.updateMenuPrompt);
router.put("/menus/:id", menuController.updateMenu);
router.delete("/menus/:id", menuController.deleteMenu);

module.exports = router;
