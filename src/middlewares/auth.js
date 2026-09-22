const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { getFirebaseAdminAuth } = require("../config/firebase");

/**
 * Express middleware to verify JWT access tokens from Authorization header.
 * Supports backend signed JWT tokens and Firebase ID tokens as fallback.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access: Token missing" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access: Invalid token format" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_fallback_secret", async (err, decoded) => {
    if (!err && decoded) {
      req.user = decoded;
      return next();
    }

    // Fallback: Verify as Firebase ID token if backend JWT verification failed
    try {
      const adminAuth = getFirebaseAdminAuth();
      if (adminAuth) {
        const decodedFb = await adminAuth.verifyIdToken(token);
        if (decodedFb && decodedFb.email) {
          req.user = { email: decodedFb.email, uid: decodedFb.uid };
          return next();
        }
      }
    } catch (fbErr) {
      // Firebase fallback failed
    }

    return res.status(403).send({ message: "Forbidden access: Invalid or expired token" });
  });
}

/**
 * Middleware to verify that the authenticated user has the 'admin' role.
 */
async function verifyAdmin(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(403).send({ message: "Forbidden: No user credentials" });
    }
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    })
      .select("role")
      .lean();

    if (user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Admin privileges required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to verify that the authenticated user has the 'agent' role (or admin).
 */
async function verifyAgent(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(403).send({ message: "Forbidden: No user credentials" });
    }
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, "i") },
    })
      .select("role")
      .lean();

    if (user?.role !== "agent" && user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Agent privileges required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyToken, verifyAdmin, verifyAgent };
