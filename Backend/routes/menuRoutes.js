const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { authorizeRoles, authenticateToken } = require("../middlewares/auth");

router.post(
  "/menus",
  authenticateToken,
  authorizeRoles("admin"),
  menuController.createMenu
);
router.post(
  "/choose-food",
  authenticateToken,
  authorizeRoles("user"),
  menuController.chooseFood
);
router.get("/menus", menuController.getMenus);
router.get("/menus/search", menuController.searchMenus);
router.get(
  "/menus/:menu_id/employee-choices",
  authenticateToken,
  authorizeRoles("admin"),
  menuController.getEmployeeMenuChoices
);
// router.put("/menus/:id", menuController.updateMenuPrompt);
router.put("/menus/:id", menuController.updateMenu);
router.delete("/menus/:id", menuController.deleteMenu);

module.exports = router;
