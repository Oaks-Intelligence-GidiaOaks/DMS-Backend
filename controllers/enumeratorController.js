import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";

// Login enumerator api/v1/enumerator/login ****
export const loginEnumerator = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id, password } = req.body;

    if (!password || !id) {
      res.status(401).json({
        message: "Please provide a password and id",
      });
    }

    // find user in database
    const enumerator = await Enumerator.findOne({ id }).select("+password");

    // check if user exist in db
    if (!enumerator) {
      res.status(401).json({
        success: false,
        message: "Invalid id or password, please try again",
      });
    }

    if (enumerator.disabled) {
      res.status(401).json({
        message:
          "Your account has been disabled. Please contact the administrator for assistance",
      });
    }

    const passwordMatch = enumerator.isPasswordMatch(password);

    if (enumerator && passwordMatch) {
      sendToken(enumerator, 200, res);
    } else {
      res
        .status(401)
        .json({ message: "Invalid email or password, please try again" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message, stack: error.stack });
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
