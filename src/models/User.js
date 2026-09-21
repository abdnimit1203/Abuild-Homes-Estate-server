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
    imgUrl: {
      type: String,
      default: "",
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

// Synchronize imgUrl and photoURL before save
userSchema.pre("save", function () {
  if (this.imgUrl && !this.photoURL) {
    this.photoURL = this.imgUrl;
  } else if (this.photoURL && !this.imgUrl) {
    this.imgUrl = this.photoURL;
  }
});

module.exports = mongoose.models.User || mongoose.model("User", userSchema, "users");
