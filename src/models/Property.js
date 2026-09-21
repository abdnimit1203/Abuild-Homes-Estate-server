const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    propertyTitle: {
      type: String,
      required: true,
      trim: true,
    },
    // Merged display location for backward compatibility
    propertyLocation: {
      type: String,
      trim: true,
    },
    // Elaborated location address components
    houseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    roadNumber: {
      type: String,
      trim: true,
      default: "",
    },
    division: {
      type: String,
      trim: true,
      default: "",
    },
    country: {
      type: String,
      trim: true,
      default: "",
    },
    continent: {
      type: String,
      trim: true,
      default: "",
    },
    propertyImage: {
      type: String,
      required: true,
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
      required: true,
      lowercase: true,
      trim: true,
    },
    agentImage: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected", "fraud"],
      default: "pending",
    },
    description: {
      type: String,
      default: "",
    },
    propertyType: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Pre-save hook: synthesize propertyLocation if empty but structured fields exist
propertySchema.pre("save", function () {
  if (!this.propertyLocation) {
    const parts = [
      this.houseNumber ? `House: ${this.houseNumber}` : "",
      this.roadNumber ? `Road: ${this.roadNumber}` : "",
      this.division,
      this.country,
      this.continent,
    ].filter(Boolean);

    if (parts.length > 0) {
      this.propertyLocation = parts.join(", ");
    }
  }
});

module.exports =
  mongoose.models.Property || mongoose.model("Property", propertySchema, "properties");
