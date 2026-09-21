const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.get("/", reviewController.getReviews);
router.post("/", reviewController.createReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
