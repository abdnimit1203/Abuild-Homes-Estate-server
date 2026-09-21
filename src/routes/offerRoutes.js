const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");

router.get("/", offerController.getOffers);
router.get("/:id", offerController.getOfferById);
router.post("/", offerController.createOffer);
router.patch("/accepted-offer", offerController.acceptOffer);
router.patch("/rejected-offer", offerController.rejectOffer);

module.exports = router;
