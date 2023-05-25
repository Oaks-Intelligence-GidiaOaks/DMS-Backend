import Jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "./catchAsyncError.js";

// Check if user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  // const { token } = req.cookies;
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Please log in to access this resource." });
  }
  const decoded = Jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findOne({ id: decoded.user.id });
  next();
});

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
    req.enumerator = await Enumerator.findOne({ id: decoded.user.id });
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
