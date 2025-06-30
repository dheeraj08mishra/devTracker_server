import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
const PORT = process.env.PORT || 3000;
import connectDB from "./config/database.js";
import authenticationRouter from "./router/authenticationRouter.js";

app.use(express.json());
app.use(cookieParser()); // Middleware to parse cookies
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // Allow credentials (cookies) to be sent
  })
);

app.use("/api", authenticationRouter);

connectDB()
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
