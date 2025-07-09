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

    const existsingLog = await DSALogs.findOne({ userId, problemLink });
    if (existsingLog) {
      return res
        .status(400)
        .json({ message: "Problem already exists in your log" });
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

dsalogRouter.get("/getLogs", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const logs = await DSALogs.find({ userId }).sort({ createdAt: -1 });
    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No logs found" });
    } else {
      res.status(200).json({ logs });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

dsalogRouter.put("/updateLog/:id", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const logId = req.params.id;
    const { problemName, problemLink, topic, difficulty, status, notes } =
      req.body;

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
    const log = await DSALogs.findOne({ _id: logId, userId });
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    const updatedLog = await DSALogs.findByIdAndUpdate(logId, {
      problemName,
      problemLink,
      topic,
      difficulty,
      status,
      notes,
    });
    res.status(200).json({
      message: "DSA log updated successfully",
      log: updatedLog,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

dsalogRouter.delete("/deleteLog/:id", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const logId = req.params.id;
    const log = await DSALogs.findOneAndDelete({ _id: logId, userId });
    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }
    res.status(200).json({ message: "DSA log deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default dsalogRouter;
