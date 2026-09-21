const mongoose = require("mongoose");
const Review = require("../models/Review");

/**
 * Retrieves reviews, optionally filtered by propertyID or userEmail.
 */
async function getReviews(req, res, next) {
  try {
    const id = req.query.id;
    const email = req.query.email;

    const query = {};
    if (id) {
      query.propertyID = id;
    }
    if (email) {
      query.userEmail = email;
    }

    const result = await Review.find(query).sort({ reviewTime: -1 }).lean();
    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new review.
 */
async function createReview(req, res, next) {
  try {
    const review = req.body;
    const result = await Review.create(review);
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
 * Deletes a review by ID.
 */
async function deleteReview(req, res, next) {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "Invalid review ID." });
    }
    const result = await Review.deleteOne({ _id: new mongoose.Types.ObjectId(id) });
    res.send(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReviews,
  createReview,
  deleteReview,
};
