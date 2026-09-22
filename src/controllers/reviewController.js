const mongoose = require("mongoose");
const Review = require("../models/Review");

/**
 * Retrieves reviews, optionally filtered by propertyID or userEmail.
 * Always joins the live users collection to return fresh userName and userImage,
 * so that profile updates are automatically reflected in all existing reviews.
 */
async function getReviews(req, res, next) {
  try {
    const id = req.query.id;
    const email = req.query.email;

    const matchStage = {};
    if (id) matchStage.propertyID = id;
    if (email) matchStage.userEmail = email;

    const result = await Review.aggregate([
      { $match: matchStage },
      { $sort: { reviewTime: -1 } },
      // Join live user data from the users collection
      {
        $lookup: {
          from: "users",
          localField: "userEmail",
          foreignField: "email",
          as: "_userDoc",
        },
      },
      {
        $addFields: {
          _liveUser: { $arrayElemAt: ["$_userDoc", 0] },
        },
      },
      {
        $addFields: {
          // Live name from user doc; fall back to stored snapshot
          userName: {
            $ifNull: [
              "$_liveUser.name",
              { $ifNull: ["$userName", "$username"] },
            ],
          },
          // Live photo from user doc; fall back to stored snapshot
          userImage: {
            $ifNull: [
              { $ifNull: ["$_liveUser.photoURL", "$_liveUser.imgUrl"] },
              { $ifNull: ["$userImage", "$userPhoto"] },
            ],
          },
        },
      },
      // Remove internal join fields from output
      {
        $project: {
          _userDoc: 0,
          _liveUser: 0,
          userPhoto: 0,
          username: 0,
        },
      },
    ]);

    res.send(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new review. Strips stale user snapshot fields before saving —
 * userName/userImage are always resolved live on read via $lookup.
 */
async function createReview(req, res, next) {
  try {
    // Destructure out snapshot fields that should never be stored
    const {
      userName,
      username,
      userImage,
      userPhoto,
      ...reviewData
    } = req.body;

    const result = await Review.create(reviewData);
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
