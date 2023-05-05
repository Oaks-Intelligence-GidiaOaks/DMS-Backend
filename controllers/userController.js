import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import generatePassword from "../utils/generatePassword.js";
import sendEmail from "../utils/sendEmail.js";

// Create team lead/admin api/v1/new/user ****
export const createUser = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, state, LGA } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists", 409));
  }

  const password = generatePassword();
  console.log(password, "** pass test hash check");

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    state,
    LGA,
  });

  sendToken(newUser, 200, res);

  // send password to user email address
  if (newUser) {
    try {
      sendEmail({
        email,
        subject: "Gidiaoks DCF Password",
        message: `Please sign in to DCF with this password: ${password}. Cheers!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
});

// Create team lead/admin api/v1/new/enumerator ****
export const createEnumerator = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, id, state, LGA } = req.body;

  const enumerator = await Enumerator.findOne({ email });

  if (enumerator) {
    return next(new ErrorHandler("Enumerator already exists", 409));
  }

  // Generate enumerator password
  const password = generatePassword();

  // Create the enumerator
  const newEnumerator = await Enumerator.create({
    firstName,
    lastName,
    email,
    password,
    phoneNumber,
    id,
    state,
    LGA,
    user: req.user.id,
  });

  sendToken(newEnumerator, 200, res);

  // send password to user email address
  if (newEnumerator) {
    try {
      sendEmail({
        email,
        subject: "Gidiaoks DCF Password",
        message: `Please sign in to DCF with this password: ${password}. Please note that password expires after 7 days`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
});

// Login user api/v1/login ****
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(
      new ErrorHandler("Please provide a password and email address", 400)
    );
  }

  // find user in database
  const user = await User.findOne({ email }).select("+password");

  // check if user exist in db
  if (!user) {
    return next(
      new ErrorHandler("Invalid email or password, please try again", 401)
    );
  }

  const passwordMatch = user.isPasswordMatch(password);

  if (user && passwordMatch) {
    sendToken(user, 200, res);
  } else {
    res.status(401);
    return next(
      new ErrorHandler("Invalid email or password, please try again", 401)
    );
  }
});
