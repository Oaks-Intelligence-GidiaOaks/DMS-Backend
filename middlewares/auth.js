import Jwt from "jsonwebtoken";
import ErrorHandler from "../utils/errorHandler.js";
import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "./catchAsyncError.js";

// Check if user is authenticated
export const isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(
      new ErrorHandler("Please log in to access this resource.", 401)
    );
  }
  const decoded = Jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});

export const isAuthenticatedEnumerator = catchAsyncErrors(
  async (req, res, next) => {
    const { token } = req.cookies;
    if (!token) {
      return next(
        new ErrorHandler("Please log in to access this resource.", 401)
      );
    }
    const decoded = Jwt.verify(token, process.env.JWT_SECRET);
    req.enumerator = await Enumerator.findById(decoded.id);
    next();
  }
);

// Handle user roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `${req.user.role} is not authorized to access this resource`,
          403
        )
      );
    }
    next();
  };
};
