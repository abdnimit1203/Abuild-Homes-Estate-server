/**
 * Centralized Express error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error("🔥 Global Server Error:", err.stack || err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).send({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
