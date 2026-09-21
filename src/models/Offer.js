const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
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
    agentName: {
      type: String,
      default: "",
    },
    agentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    buyerName: {
      type: String,
      default: "",
    },
    buyerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    offeredAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "bought"],
      default: "pending",
    },
    buyingDate: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    transacionId: {
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
  mongoose.models.Offer || mongoose.model("Offer", offerSchema, "offers");
