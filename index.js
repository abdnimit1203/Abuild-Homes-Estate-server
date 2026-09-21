require("dotenv").config();
const dns = require("dns");

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const { connectDB } = require("./src/config/db");
const app = require("./src/index");

const port = process.env.PORT || 5000;

// When running as a standalone server (local dev, Render, container)
// If running in Vercel serverless environment, Vercel manages the HTTP listener and invokes the exported app.
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      app.listen(port, () => {
        console.log(`Abuild Homes Estates server running on port: ${port}`);
      });
    })
    .catch((err) => {
      console.warn("⚠️ Initial DB connection deferred or failed:", err.message);
      app.listen(port, () => {
        console.log(`Abuild Homes Estates server running on port: ${port} (retry mode)`);
      });
    });
}

module.exports = app;
