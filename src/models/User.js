const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "agent", "admin", "fraud"],
      default: "user",
    },
    photoURL: {
      type: String,
      default: "",
    },
    uid: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false, // Allows backward compatibility with existing document shapes
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "users");
