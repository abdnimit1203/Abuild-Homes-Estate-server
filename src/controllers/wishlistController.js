const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");

/**
 * Retrieves wishlist items, optionally filtered by user email.
 */
async function getWishlists(req, res, next) {
  try {
    const email = req.query.email;
    const query = email ? { userEmail: email } : {};
    const result = await Wishlist.find(query).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieves a single wishlist item by ID.
 */
async function getWishlistById(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid wishlist item ID." });
    }
    const result = await Wishlist.findById(id).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Adds an item to the wishlist.
 */
async function createWishlist(req, res, next) {
  try {
    const wishlist = req.body;
    const result = await Wishlist.create(wishlist);
    res.send({
      acknowledged: true,
      insertedId: result._id,
      ...result.toObject(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Removes an item from the wishlist by ID.
 */
async function deleteWishlist(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid wishlist item ID." });
    }
    const result = await Wishlist.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.send(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getWishlists,
  getWishlistById,
  createWishlist,
  deleteWishlist,
};
