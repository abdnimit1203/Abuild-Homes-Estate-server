/**
 * Security middleware that blocks direct browser address-bar inspection
 * and ensures requests originate from authorized client applications or API consumers.
 */
function apiGuard(req, res, next) {
  // Allow OPTIONS preflight and root health-check endpoints
  if (req.method === "OPTIONS" || req.path === "/" || req.path === "/reviews") {
    return next();
  }

  const secFetchDest = req.headers["sec-fetch-dest"];
  const secFetchMode = req.headers["sec-fetch-mode"];
  const acceptHeader = req.headers["accept"] || "";
  const clientHeader = req.headers["x-client-request"];
  const authHeader = req.headers["authorization"];

  // Detect direct browser tab navigation (typing URL into address bar)
  const isDirectBrowserNavigation =
    secFetchDest === "document" ||
    secFetchMode === "navigate" ||
    (acceptHeader.includes("text/html") && !authHeader && !clientHeader);

  if (isDirectBrowserNavigation) {
    return res.status(403).json({
      error: "Forbidden",
      message:
        "Direct browser URL navigation to API endpoints is blocked for privacy and security. Requests must originate from authorized client applications or supply authentication credentials.",
      status: 403,
      timestamp: new Date().toISOString(),
    });
  }

  next();
}

module.exports = { apiGuard };
