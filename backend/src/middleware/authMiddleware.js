
const jwt = require("jsonwebtoken");

// Protects a route: requires a valid access token cookie.
function requireAuth(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

module.exports = { requireAuth };
