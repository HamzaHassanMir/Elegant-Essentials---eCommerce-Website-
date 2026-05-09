import express        from "express";
import bcrypt         from "bcryptjs";
import jwt            from "jsonwebtoken";
import passport       from "../config/passport.js";
import User           from "../models/User.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Helper — sign a JWT and return it
const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER  (email + password)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json("Email already registered");

    const hashed = await bcrypt.hash(password, 10);
    const user   = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: "Registered successfully", userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error during registration");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN  (email + password)
// ─────────────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("User not found");

    // Google-only accounts have no password
    if (!user.password) return res.status(400).json("Please sign in with Google");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) return res.status(400).json("Invalid credentials");

    res.json({ token: signToken(user._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json("Server error during login");
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH  — step 1: redirect to Google
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE OAUTH  — step 2: callback from Google
// ─────────────────────────────────────────────────────────────────────────────
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed` }),
  (req, res) => {
    // Issue a JWT and redirect to frontend with token in query string
    const token = signToken(req.user._id);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    res.redirect(`${clientUrl}/oauth-callback?token=${token}`);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// GET current user info  (used after OAuth to fetch profile)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json("No token");

    const decoded = jwt.verify(authHeader.split(" ")[1], JWT_SECRET);
    const user    = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json("User not found");

    res.json(user);
  } catch {
    res.status(401).json("Invalid token");
  }
});

export default router;
