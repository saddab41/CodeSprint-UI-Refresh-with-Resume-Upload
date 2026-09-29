import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

const ALLOWED_ROLES = [
  "STUDENT",
  "ACADEMICIAN",
  "INDUSTRY",
];

const safe = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  skills: user.skills || [],
});

const sign = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/* REGISTER */
router.post(
  "/register",
  async (req, res, next) => {
    try {
      let {
        name,
        email,
        password,
        role = "STUDENT",
      } = req.body;

      name = name?.trim();
      email = email?.toLowerCase().trim();
      role = role?.toUpperCase();

      if (!name) {
        return res.status(400).json({
          message:
            "Please enter your full name",
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          message:
            "Name cannot exceed 100 characters",
        });
      }

      if (!email) {
        return res.status(400).json({
          message:
            "Please enter your email address",
        });
      }

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address",
        });
      }

      if (!password) {
        return res.status(400).json({
          message:
            "Please enter a password",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must contain at least 6 characters",
        });
      }

      if (!ALLOWED_ROLES.includes(role)) {
        return res.status(400).json({
          message:
            "Please select a valid account type",
        });
      }

      const existingUser =
        await User.findOne({
          email,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        skills: [],
      });

      return res.status(201).json({
        message:
          "Account created successfully",
        token: sign(user),
        user: safe(user),
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message:
            "An account with this email already exists",
        });
      }

      next(error);
    }
  }
);

/* LOGIN */
router.post(
  "/login",
  async (req, res, next) => {
    try {
      let { email, password } =
        req.body;

      email = email?.toLowerCase().trim();

      if (!email) {
        return res.status(400).json({
          message:
            "Please enter your email address",
        });
      }

      if (!password) {
        return res.status(400).json({
          message:
            "Please enter your password",
        });
      }

      const user = await User.findOne({
        email,
      });

      if (!user) {
        return res.status(401).json({
          message:
            "No account found with this email",
        });
      }

      const isPasswordCorrect =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isPasswordCorrect) {
        return res.status(401).json({
          message:
            "Incorrect password. Please try again",
        });
      }

      return res.status(200).json({
        message: "Login successful",
        token: sign(user),
        user: safe(user),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;