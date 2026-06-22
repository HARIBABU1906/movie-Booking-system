const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "change_this_secret",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res) {
  try {
    const { name, email, userId, password, role } = req.body;
    const normalizedEmail = (email || userId || "").trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role && ["admin", "owner", "user"].includes(role) ? role : "user",
    });

    return res.status(201).json({
      message: "Registration successful.",
      user: {
        id: String(user._id),
        name: user.name,
        userId: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
}

async function login(req, res) {
  try {
    const { email, userId, password } = req.body;
    const normalizedEmail = (email || userId || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: String(user._id),
        name: user.name,
        role: user.role,
        userId: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login." });
  }
}

function me(req, res) {
  return res.json({
    user: {
      id: String(req.user._id),
      name: req.user.name,
      role: req.user.role,
      userId: req.user.email,
    },
  });
}

async function ensureDefaultUsers() {
  const defaults = [
    {
      name: "System Admin",
      email: (process.env.ADMIN_EMAIL || "admin@moviebooking.com").toLowerCase(),
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin",
    },
    {
      name: "Theater Owner",
      email: (process.env.OWNER_EMAIL || "owner@moviebooking.com").toLowerCase(),
      password: process.env.OWNER_PASSWORD || "owner123",
      role: "owner",
    },
  ];

  for (const account of defaults) {
    const exists = await User.findOne({ email: account.email });
    if (!exists) {
      const hash = await bcrypt.hash(account.password, 10);
      await User.create({ ...account, password: hash });
      console.log(`Seeded ${account.role} user: ${account.email}`);
    }
  }
}

module.exports = { register, login, me, ensureDefaultUsers };
