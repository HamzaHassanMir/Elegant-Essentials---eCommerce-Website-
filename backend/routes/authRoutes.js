// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import passport from "passport"; // 1. Import passport
// import User from "../models/User.js";

// const router = express.Router();

// // ── GOOGLE AUTH ROUTES ───────────────────────────────────────────────────────

// // This initiates the Google login process
// router.get("/google", passport.authenticate("google", {
//   scope: ["profile", "email"],
// }));

// // This handles the response after the user logs in via Google
// router.get("/google/callback", 
//   passport.authenticate("google", { failureRedirect: "/login", session: false }),
//   (req, res) => {
//     // Generate a JWT for the user (just like your manual login)
//     const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || "secretkey", {
//       expiresIn: "7d",
//     });

//     // Redirect back to your frontend with the token in the URL 
//     // (or handle via cookies if you prefer)
//     res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/login-success?token=${token}`);
//   }
// );

// // ── EXISTING ROUTES ──────────────────────────────────────────────────────────

// router.post("/register", async (req, res) => {
//   /* ... your existing register code ... */
// });

// router.post("/login", async (req, res) => {
//   /* ... your existing login code ... */
// });

// export default router;

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/User.js";

const router = express.Router();

// ── GOOGLE AUTH ROUTES ────────────────────────────────────────────────────────

router.get("/google", passport.authenticate("google", {
  scope: ["profile", "email"],
}));

// FIX: redirect to /oauth-callback (not /login-success) to match OAuthCallback.jsx
router.get("/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=oauth_failed`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "7d",
    });
    // Redirect to /oauth-callback which stores the token and redirects home
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/oauth-callback?token=${token}`);
  }
);

// ── REGISTER ─────────────────────────────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json("Name, email and password are required");
    }
    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json("An account with this email already exists");
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json("Server error during registration");
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json("Invalid email or password");
    }

    // If user signed up via Google, they have no password
    if (!user.password) {
      return res.status(401).json("This account uses Google sign-in. Please continue with Google.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json("Invalid email or password");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secretkey", {
      expiresIn: "7d",
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json("Server error during login");
  }
});

export default router;