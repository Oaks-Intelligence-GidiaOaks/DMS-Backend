import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AuditTrail from "./auditTrailModel.js";

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
    minlenght: [8, "id must be at least 8 characters"],
    required: [true, "please enter your id"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlenght: [6, "Password must be at least 6 characters"],
    select: false,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  identityType: {
    type: String,
    enum: ["NIN", "Passport", "Voters Card", "Drivers license"],
  },
  identity: {
    type: String,
    required: true,
    unique: true,
  },
  identityImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  states: [
    {
      type: String,
    },
  ],
  disabled: {
    type: Boolean,
    default: false,
  },
  firstUse: {
    type: Boolean,
    default: true,
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

// populate audit trail
userSchema.pre("save", function (next) {
  if (this.isNew) {
    // Document is new, store "create" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "User",
      documentId: this._id,
      action: "create",
    });
    auditTrailEntry.save();
  } else {
    // Document is being updated, store "update" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "User",
      documentId: this._id,
      action: "update",
    });
    auditTrailEntry.save();
  }
  next();
});

export default model("User", userSchema);
