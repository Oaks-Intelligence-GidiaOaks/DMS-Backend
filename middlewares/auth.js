import Jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "./catchAsyncError.js";

// Check if user is authenticated
// export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
export const isAuthenticatedUser = async (req, res, next) => {
  try {
    // const { token } = req.cookies;
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ message: "Please log in to access this resource." });
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
  }
};

export const isAuthenticatedEnumerator = catchAsyncErrors(
  async (req, res, next) => {
    // const { token } = req.cookies;
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ message: "Please log in to access this resource." });
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded);
    req.enumerator = decoded.user;
    next();
  }
);

// Handle user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        message: `${req.user.role} is not authorized to access this resource`,
      });
    }
    next();
  };
};
