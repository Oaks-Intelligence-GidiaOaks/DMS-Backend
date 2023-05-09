import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";

// Login enumerator api/v1/enumerator/login ****
export const loginEnumerator = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!password || !email) {
      res.status(401).json({
        message: "Please provide a password and email address",
      });
      // return next(
      //   new ErrorHandler("Please provide a password and email address", 400)
      // );
    }

    // find user in database
    const enumerator = await Enumerator.findOne({ email }).select("+password");

    // check if user exist in db
    if (!enumerator) {
      res.status(401).json({
        message: "Invalid email or password, please try again",
      });
      // return next(
      //   new ErrorHandler("Invalid email or password, please try again", 401)
      // );
    }

    if (enumerator.disabled) {
      res.status(401).json({
        message:
          "Your account has been disabled. Please contact the administrator for assistance",
      });
      // new ErrorHandler(
      //   "Your account has been disabled. Please contact the administrator for assistance",
      //   401
      // );
    }

    const passwordMatch = enumerator.isPasswordMatch(password);

    if (enumerator && passwordMatch) {
      sendToken(enumerator, 200, res);
    } else {
      //  res.status(401);
      res
        .status(401)
        .json({ message: "Invalid email or password, please try again" });
      //  return next(
      //    new ErrorHandler("Invalid email or password, please try again", 401)
      //  );
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get currently logged in enumerator profile => api/v1/me ****
export const getEnumeratorProfile = catchAsyncErrors(async (req, res, next) => {
  const enumerator = await Enumerator.findById(req.user.id);

  if (enumerator.disabled) {
    new ErrorHandler(
      "Your account has been disabled. Please contact the administrator for assistance",
      401
    );
  }

  res.status(200).json({
    success: true,
    enumerator,
  });
});

// Logout enumerator => api/v1/logout ****
export const logoutEnumerator = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});
