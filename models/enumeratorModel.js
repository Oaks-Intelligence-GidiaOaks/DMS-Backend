import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import moment from "moment";

const { Schema, model } = mongoose;

// Create a schema for an enumerator
const EnumeratorSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "Please enter a first name"],
    maxLength: [30, "First name cannot exceed 30 characters"],
  },
  lastName: {
    type: String,
    required: [true, "Please enter a first name"],
    maxLength: [30, "First name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "please enter an email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: true,
    minlenght: [6, "Password must be at least 6 characters"],
    select: false,
  },
  passwordExpiresAt: {
    type: Date,
    default: () => moment().add(7, 'days')
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  LGA: [
    {
      type: String,
      required: true,
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

EnumeratorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Define a Schema method to check if the password matches
EnumeratorSchema.methods.isPasswordMatch = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Get JWT token
EnumeratorSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_SECRET_EXPIRES,
  });
};

// Create a model from the schema and export
export default model("Enumerator", EnumeratorSchema);
