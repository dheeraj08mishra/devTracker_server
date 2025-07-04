import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.mongodb_URI);
  } catch (err) {
    console.error("MongoDB connection error;", err);
  }
};

export default connectDB;
