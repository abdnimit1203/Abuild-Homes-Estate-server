const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    propertyTitle: {
      type: String,
      default: "",
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
    agentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    soldPrice: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    offersId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

module.exports =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema, "payments");
