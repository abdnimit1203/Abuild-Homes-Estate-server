const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    propertyID: {
      type: String,
      required: true,
    },
    propertyTitle: {
      type: String,
      default: "",
    },
    propertyLocation: {
      type: String,
      default: "",
    },
    propertyImage: {
      type: String,
      default: "",
    },
    priceRange: {
      type: String,
      default: "",
    },
    minPrice: {
      type: Number,
      default: 0,
    },
    maxPrice: {
      type: Number,
      default: 0,
    },
    agentName: {
      type: String,
      default: "",
    },
    agentEmail: {
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
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports =
  mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema, "wishlists");
