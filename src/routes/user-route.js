const express = require("express");
const userController = require("../controllers/user-controller");
const authenticate = require("../middlewares/authenticate");
const uploadMiddleware = require("../middlewares/upload");
const router = express.Router();

router.patch(
  "/",
  uploadMiddleware.single("qwerty"),
  authenticate,
  userController.updateProfile
);

module.exports = router;
