const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/role", userController.getUserRole);
router.patch("/", userController.updateUserRole);
router.patch("/fraud", userController.markUserAsFraud);
router.delete("/", userController.deleteUser);

module.exports = router;
