const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const { verifyToken, verifyAgent } = require("../middlewares/auth");

// Public property listing (data privacy handled in controller: only verified by default)
router.get("/", propertyController.getProperties);
router.get("/:id", propertyController.getPropertyById);

// Protected agent mutations (prevents unauthorized property tampering)
router.post("/", verifyToken, propertyController.createProperty);
router.patch("/:id", verifyToken, propertyController.updateProperty);
router.delete("/:id", verifyToken, propertyController.deleteProperty);

module.exports = router;
