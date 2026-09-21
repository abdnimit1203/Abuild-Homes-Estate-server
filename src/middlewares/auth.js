const jwt = require("jsonwebtoken");

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

module.exports = { verifyToken };
