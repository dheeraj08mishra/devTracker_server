import express from "express";
import User from "../model/user.js";
import validator from "validator";
import jwt from "jsonwebtoken";

const authenticationRouter = express.Router();

authenticationRouter.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, password, email } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (validator.isEmpty(firstName) || validator.isEmpty(lastName)) {
      return res
        .status(400)
        .json({ message: "First Name and Last Name cannot be empty" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with upper, lower, number and symbol.",
      });
    }

    if (!validator.isEmail(email.trim().toLowerCase())) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validator.isLength(firstName, { min: 3, max: 20 })) {
      return res.status(400).json({
        message: "First name must be between 3 and 20 characters",
      });
    }
    if (!validator.isLength(lastName, { min: 3, max: 20 })) {
      return res.status(400).json({
        message: "Last name must be between 3 and 20 characters",
      });
    }
    // Trim and normalize email
    const normalizedEmail = validator.normalizeEmail(
      email.trim().toLowerCase()
    );

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
    });

    await newUser.save();

    res.status(201).json({
      message: `User ${firstName} ${lastName} created successfully`,
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authenticationRouter.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    email = validator.normalizeEmail(email.trim().toLowerCase());
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const ispasswordValid = await existingUser.comparePassword(password);
    if (!ispasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = existingUser.getJWT();
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: Number(process.env.COOKIES_AGE) || 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: `Welcome back ${existingUser.firstName} ${existingUser.lastName}`,
      user: {
        email: existingUser.email,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        photo: existingUser.photo,
        _id: existingUser._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authenticationRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

authenticationRouter.get("/check-auth", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Unauthorized, please login" });
    }
    const user = await User.findById(decoded.userId).select(
      "_id email firstName lastName photo"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User is authenticated",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default authenticationRouter;
