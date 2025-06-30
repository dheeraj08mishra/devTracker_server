import express from "express";
import User from "../model/user.js";
import validator from "validator";

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

export default authenticationRouter;
