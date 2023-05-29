import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Schema, model } = mongoose;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please enter a first name"],
    maxLength: [30, "First name cannot exceed 30 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter a last name"],
    maxLength: [30, "Last name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "please enter an email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  id: {
    type: String,
    required: [true, "please enter your id"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlenght: [6, "Password must be at least 6 characters"],
    select: false,
  },
  avarter: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  state: [
    {
      type: String,
    },
  ],
  disabled: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "team_lead",
  },
  LGA: [
    {
      type: String,
    },
  ],
  enumerators: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enumerator",
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Define a Schema method to check if the password matches
userSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate the password reset token
  const resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetPasswordToken)
    .digest("hex");

  // Set reset password token expiration time
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  return resetPasswordToken;
};

export default model("User", userSchema);
