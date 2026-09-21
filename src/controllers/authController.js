const jwt = require("jsonwebtoken");

/**
 * Signs and issues a JWT token for the authenticated user.
 */
async function createToken(req, res, next) {
  try {
    const user = req.body;
    const token = jwt.sign(
      user,
      process.env.ACCESS_TOKEN_SECRET || "default_fallback_secret",
      { expiresIn: "1h" }
    );
    res.send({ token });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createToken,
};
