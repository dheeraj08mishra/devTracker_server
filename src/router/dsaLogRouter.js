import express from "express";
import DSALogs from "../model/dsalog.js";
import userAuth from "../middleware/userAuth.js";
import validator from "validator";

const dsalogRouter = express.Router();

dsalogRouter.post("/addQuestion", userAuth, async (req, res) => {
  try {
    const { problemName, problemLink, topic, difficulty, status, notes } =
      req.body;
    const userId = req.user._id;
    //validate user input
    if (!problemName || !topic || !difficulty || !status) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (
      problemLink &&
      !validator.isURL(problemLink, {
        protocols: ["http", "https"],
        require_protocol: true,
        require_tld: true,
      })
    ) {
      return res.status(400).json({ message: "Invalid problem link" });
    }
    const newLog = new DSALogs({
      userId,
      problemName,
      problemLink,
      topic,
      difficulty,
      status,
      notes,
    });
    const savedLog = await newLog.save();

    res.status(201).json({
      message: "DSA log added successfully",
      log: savedLog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default dsalogRouter;
