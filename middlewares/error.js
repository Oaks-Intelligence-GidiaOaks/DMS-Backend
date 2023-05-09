import ErrorHandler from "../utils/errorHandler.js";

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      errStack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;

    // Handling wrong mongoose Id Error
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid:  ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // Handling mongooose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Handling mongoose duplicate key error
    if (err.code === 11000) {
      const message = `Duplicate values for ${Object.keys(
        err.keyValue
      )} entered`;
      error = new ErrorHandler(message, 400);
    }

    // Handling wrong Jwt error
    if (err.name === "JsonWebTokenError") {
      const message = "JSON Web Token is invalid, please try again!";
      error = new ErrorHandler(message, 400);
    }

    // Handling expired Jwt error
    if (err.name === "TokenExpiredError") {
      const message = "JSON Web Token is expired, please try again!";
      error = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
      success: false,
      message: error.message,
    });
  }
};
