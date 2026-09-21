const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.get("/", wishlistController.getWishlists);
router.get("/:id", wishlistController.getWishlistById);
router.post("/", wishlistController.createWishlist);
router.delete("/:id", wishlistController.deleteWishlist);

module.exports = router;
