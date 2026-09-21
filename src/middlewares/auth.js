const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Express middleware to verify JWT access tokens from Authorization header.
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

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "default_fallback_secret", (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access: Invalid or expired token" });
    }
    req.user = decoded;
    next();
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
    const user = await User.findOne({ email }).select("role").lean();
    if (user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Admin privileges required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware to verify that the authenticated user has the 'agent' role.
 */
async function verifyAgent(req, res, next) {
  try {
    const email = req.user?.email;
    if (!email) {
      return res.status(403).send({ message: "Forbidden: No user credentials" });
    }
    const user = await User.findOne({ email }).select("role").lean();
    if (user?.role !== "agent" && user?.role !== "admin") {
      return res.status(403).send({ message: "Forbidden: Agent privileges required" });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { verifyToken, verifyAdmin, verifyAgent };
