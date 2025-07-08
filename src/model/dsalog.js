import mongoose from "mongoose";
const { Schema } = mongoose;
import validator from "validator";

const dsalogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    problemName: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Problem name must be at least 3 characters"],
      maxLength: [100, "Problem name must be at most 100 characters"],
    },
    problemLink: {
      type: String,
      trim: true,
      validate: {
        validator: (v) =>
          validator.isURL(v, {
            protocols: ["http", "https"],
            require_protocol: true,
            require_tld: true,
          }),
      },
    },
    topic: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one topic is required",
      },
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },
    status: {
      type: String,
      required: true,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    notes: {
      type: String,
      trim: true,
      maxLength: [500, "Notes must be at most 500 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
const DSALogs = mongoose.model("DSALogs", dsalogSchema);
export default DSALogs;
