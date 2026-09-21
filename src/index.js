const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");

// Controllers needed for top-level root aliases
const userController = require("./controllers/userController");
const propertyController = require("./controllers/propertyController");
const offerController = require("./controllers/offerController");
const paymentController = require("./controllers/paymentController");

// Routers
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const offerRoutes = require("./routes/offerRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

let reviewsData = [];
try {
  reviewsData = require("../reviews.json");
} catch (e) {
  try {
    reviewsData = require("./reviews.json");
  } catch (err) {
    reviewsData = [];
  }
}

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Serverless DB connection middleware (caches connection across warm lambdas)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed on request:", err.message);
    // Proceed so health check or unauthenticated routes can still answer if needed
    next();
  }
});

// Authentication / JWT
app.use("/", authRoutes);

// Resource routers
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/properties", propertyRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/wishlists", wishlistRoutes);
app.use("/api/v1/offers", offerRoutes);
app.use("/api/v1/payments", paymentRoutes);

// Direct alias endpoints for complete backwards compatibility
app.patch("/api/v1/username", userController.updateUsername);
app.patch("/api/v1/make-verified", propertyController.makeVerified);
app.patch("/api/v1/make-rejected", propertyController.makeRejected);
app.patch("/api/v1/accepted-offer", offerController.acceptOffer);
app.patch("/api/v1/rejected-offer", offerController.rejectOffer);
app.post("/create-payment-intent", paymentController.createPaymentIntent);

// Static / fallback endpoints
app.get("/reviews", (req, res) => {
  res.send(reviewsData);
});

app.get("/", (req, res) => {
  res.send("Real estate Abuild Homes server data is here...");
});

// Centralized error handling
app.use(errorHandler);

module.exports = app;
