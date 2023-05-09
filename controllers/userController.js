import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import generatePassword from "../utils/generatePassword.js";
import sendEmail from "../utils/sendEmail.js";

// Create team lead/admin api/v1/user/new ****
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

// Create team lead/admin api/v1/enumerator/new ****
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

  if (user.disabled) {
    new ErrorHandler(
      "Your account has been disabled. Please contact the administrator for assistance",
      401
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

// Forgot password => api/v1/password/reset ****
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new ErrorHandler("Email not found", 404));
  }

  // Get reset password token
  const resetPasswordToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetPasswordToken}`;

  // email message
  const message = `Click this link to reset your password:\n\n${resetPasswordUrl}\n\nIf your have not requested a password reset please ignore.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopNow Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent successfully to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // save user again
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

// Reset password => api/v1/password/reset/:token ****
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Hash the url Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler("Password reset token is ivalid or has expired", 400)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  sendToken(user, 200, res);
});

// Get currently logged in user profile => api/v1/me ****
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.disabled) {
    new ErrorHandler(
      "Your account has been disabled. Please contact the administrator for assistance",
      401
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update password => api/v1/password/update ****
export const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Verify old password is correct
  const VerifyPassword = await user.isPasswordMatch(req.body.oldPassword);

  if (!VerifyPassword) {
    return next(new ErrorHandler("Old password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Update user details/profile => api/v1/me/update ****
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserDetails = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    id: req.body.id,
    state: req.body.state,
    LGA: req.body.LGA,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

// Logout user => api/v1/logout ****
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Admin Routes ********

// Get all users => api/v1/admin/users ****
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

// Get specific user => api/v1/admin/users/:id ****
export const getOneUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User with id ${req.params.id} does not exist`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user details/profile ADMIN => api/v1/admin/user/:id ****
export const updateUserProfileAdmin = catchAsyncErrors(
  async (req, res, next) => {
    const newUserDetails = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      id: req.body.id,
      state: req.body.state,
      LGA: req.body.LGA,
      role: req.body.role,
    };

    const user = await User.findByIdAndUpdate(req.params.id, newUserDetails, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
);

// Disable enumerator ADMIN => api/v1/admin/enumerator/:id/disable ****
export const disableEnumerator = catchAsyncErrors(async (req, res, next) => {
  
  const enumerator = await Enumerator.findByIdAndUpdate(req.params.id, { disabled: true }, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if(!enumerator){
    return next(new ErrorHandler(`User with id ${req.params.id} not found`))
  }

  res.status(200).json({
    success: true,
    message: "enumerator disabled",
  });
});


// Disable user ADMIN => api/v1/admin/enumerator/:id/disable ****
export const disableUser = catchAsyncErrors(async (req, res, next) => {
  
  const user = await User.findByIdAndUpdate(req.params.id, { disabled: true }, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if(!user){
    return next(new ErrorHandler(`User with id ${req.params.id} not found`))
  }

  res.status(200).json({
    success: true,
    message: "user disabled",
  });
});

export const seed = catchAsyncErrors(async (req, res) => {
  try {
    const { firstName, lastName, password, email, state, LGA, role } = req.body;
    const user = await User.create({ firstName, lastName, email, state, username, password, LGA, role });
    res.status(201).json({ message: 'Super admin created successfully!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});
