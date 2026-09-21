const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyAdmin } = require("../middlewares/auth");

router.post("/", userController.createUser);
router.get("/", userController.getUsers);
router.get("/role", userController.getUserRole);
router.patch("/profile", userController.updateUserProfile);
router.patch("/", verifyToken, verifyAdmin, userController.updateUserRole);
router.patch("/fraud", verifyToken, verifyAdmin, userController.markUserAsFraud);
router.delete("/", verifyToken, verifyAdmin, userController.deleteUser);

module.exports = router;
