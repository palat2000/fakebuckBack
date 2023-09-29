const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const authenticateMiddleware = require("../middlewares/authenticate");

router.get("/me", authenticateMiddleware, authController.getMe);

router.post("/register", authController.register);

router.post("/login", authController.login);

module.exports = router;
