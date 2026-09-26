const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

// Slows down brute-force attempts at the network level too.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many login attempts. Try again later." },
});

function signAccessToken(user) {
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
}

function setAuthCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true, // not readable by JS -> protects against XSS token theft
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });
}

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/login  (Task 4 — secure login)
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Same generic error whether the email exists or not -> don't leak
    // which emails are registered.
    const genericError = { error: "Invalid email or password." };
    if (!user) return res.status(401).json(genericError);

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        error: `Account temporarily locked due to failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return res.status(401).json(genericError);
    }

    // Successful password check -> reset lockout counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    // --- TODO (Task 2 - 2FA) ---
    // If user.twoFactorEnabled is true, do NOT issue the access token yet.
    // Instead: generate a short-lived challenge token, email/send the OTP,
    // and return { twoFactorRequired: true, challengeId } so the frontend
    // can show a "enter your 2FA code" screen, then call a new
    // POST /api/auth/2fa/verify route to finish login.

    const token = signAccessToken(user);
    setAuthCookie(res, token);

    return res.json({
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("accessToken");
  return res.json({ message: "Logged out." });
});

// GET /api/auth/me  (used by frontend to check session on load)
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select("name email twoFactorEnabled");
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user });
});

// --- TODO (Task 3 - password reset) ---
// POST /api/auth/forgot-password  -> generate reset token, hash + store it
//   on the user with an expiry, email a reset link containing the raw token.
// POST /api/auth/reset-password   -> look up user by hashed token, check
//   expiry, set new passwordHash, clear the reset fields.

module.exports = router;

