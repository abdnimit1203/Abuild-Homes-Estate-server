const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    propertyID: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      default: "",
    },
    userEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      default: "",
    },
    userImage: {
      type: String,
      default: "",
    },
    reviewDescription: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 5,
    },
    reviewTime: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports =
  mongoose.models.Review || mongoose.model("Review", reviewSchema, "reviews");
