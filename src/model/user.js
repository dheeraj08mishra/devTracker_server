import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minLength: [3, "First name must be at least 3 characters"],
      maxLength: [20, "First name must be at most 20 characters"],
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => validator.isAlpha(v, "en-US", { ignore: " " }),
        message: "First name must contain only letters and spaces",
      },
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      lowercase: true,
      minLength: [3, "Last name must be at least 3 characters"],
      maxLength: [20, "Last name must be at most 20 characters"],
      validate: {
        validator: (v) => validator.isAlpha(v, "en-US", { ignore: " " }),
        message: "Last name must contain only letters and spaces",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minLength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: (v) =>
          validator.isStrongPassword(v, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0,
          }),
        message:
          "Password must be at least 8 characters long, with at least one lowercase letter, one uppercase letter, and one number.",
      },
    },

    photo: {
      type: String,
      default:
        "https://res.cloudinary.com/dz1qj3v2h/image/upload/v1735681234/default_user_photo.png",
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getJWT = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || "7d",
  });
};

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
