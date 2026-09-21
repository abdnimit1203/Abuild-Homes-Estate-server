const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const { apiGuard } = require("./middlewares/apiGuard");

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

// Whitelist configuration for CORS
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://abuild-homes-estate-abd.netlify.app",
  "https://abuild-homes-estate-client.vercel.app",
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.trim().replace(/\/$/, ""));
}

app.use(
  cors({
    origin: function (origin, callback) {
      const isAllowed =
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production";

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Unauthorized origin (${origin})`));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Blocker & Privacy Middleware: Blocks direct browser address-bar inspection
app.use(apiGuard);

// Serverless DB connection middleware (caches connection across warm lambdas)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed on request:", err.message);
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
app.patch("/api/v1/update-profile", userController.updateUserProfile);
app.patch("/api/v1/users/profile", userController.updateUserProfile);
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
