// validators.js
const { body, validationResult } = require("express-validator");

exports.registerValidationRules = () => {
  return [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
    body("name").notEmpty().withMessage("Name is required"),
    body("office").notEmpty().withMessage("Office is required"),
    body("nid_number").notEmpty().withMessage("NID number is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
  ];
};

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
