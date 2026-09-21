const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/jwt", authController.createToken);

module.exports = router;
