import User from "../models/userModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import sendToken from "../utils/sendToken.js";
import { generateId, generatePassword } from "../utils/generateId.js";
import sendEmail from "../utils/sendEmail.js";
import cloudinary from "cloudinary";
import error from "../middlewares/error.js";
import { request } from "express";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// Get the start and end timestamps of the current month
const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

// Create team lead/admin api/v1/user/new ****
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, role, state, LGA } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      res.status(400).json({
        message: "User already exists",
      });
    }

    // get all users, map ids into list
    const users = await User.find({});
    const userIds = users.map((user) => user.id);

    // Generate a new id until it is unique
    const id = generateId();
    while (userIds.includes(id)) {
      // Assign a new value to id here
      id = generateId();
    }

    // const resultUserAvarter = await cloudinary.v2.uploader.upload(
    //   req.body.avarter,
    //   {
    //     folder: "avarters",
    //     width: 150,
    //     crop: "scale",
    //   }
    // );

    const newUser = await User.create({
      id,
      firstName,
      lastName,
      email,
      role,
      password: "123456",
      avarter: {
        public_id: "resultUserAvarter.public_id",
        url: "resultUserAvarter.secure_url",
      },
      state,
      LGA,
    });

    // send password to user email address
    if (newUser) {
      try {
        sendEmail({
          email,
          subject: "Gidiaoks DCF Password",
          message: `Please sign in to DCF with this password: ${id}. Cheers!`,
        });
      } catch (error) {
        res.status(400).json({
          message: error.message,
        });
      }
    }

    // sendToken(newUser, 200, res);
    res.status(200).json({
      success: true,
      newUser,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      stack: error.stack,
    });
  }
};

// Create enumerator lead/admin api/v1/enumerator/new ****
export const createEnumerator = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      identityType,
      identity,
      state,
      LGA,
    } = req.body;

    const enumerator = await Enumerator.findOne({ email });

    if (enumerator) {
      res.status(409).json({
        success: false,
        message: `Enumerator already exists`,
      });
    }

    // get all enumerators, map ids into list
    const enumerators = await Enumerator.find({});
    const enumeratorsIds = enumerators.map((enumerator) => enumerator.id);

    // Generate a new id until it is unique
    const id = generateId();
    while (enumeratorsIds.includes(id)) {
      // Assign a new value to id here
      id = generateId();
    }

    // Generate a new password
    // const password = generatePassword();
    const password = 123456;
    console.log(password, "**pass");

    // const resultUserAvarter = await cloudinary.v2.uploader.upload(
    //   req.body.avarter,
    //   {
    //     folder: "avarters",
    //     width: 150,
    //     crop: "scale",
    //   }
    // );
    // Create the enumerator
    const newEnumerator = await Enumerator.create({
      firstName,
      lastName,
      email,
      id,
      password,
      phoneNumber,
      identityType,
      identity,
      identityImage: {
        public_id: "resultUserAvarter.public_id",
        url: "resultUserAvarter.secure_url",
      },
      state,
      LGA,
      user: req.user._id,
    });

    const user = await User.findById(req.user._id);
    user.enumerators.push(newEnumerator._id);
    await user.save();

    // send password to user email address
    if (newEnumerator) {
      try {
        sendEmail({
          email,
          subject: "Gidiaoks DCF Password",
          message: `Please sign in to DCF with this password: ${password}. Cheers!`,
        });
      } catch (error) {
        res.status(500).json({ error });
      }
    }
    // sendToken(newEnumerator, 200, res);

    res.status(200).json({
      success: true,
      newEnumerator,
    });
  } catch (error) {
    // res.status(500).json({ message: error.message, stack: error.stack });
    res.status(500).json(error.message);
  }
};

// Login user api/v1/login ****
export const loginUser = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!password || !id) {
      res.status(400).json({
        message: "Please provide a password and id",
      });
    }

    // find user in database
    const user = await User.findOne({ id }).select("+password");

    if (user) {
      // return eror if user/enumerator dont exist in db
      if (!user) {
        res.status(401).json({
          message: "Invalid Id or password, please try again",
        });
      }

      if (user.disabled) {
        res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }

      const passwordMatch = user.isPasswordMatch(password);
      const token = sendToken(user);

      res.status(200).json({ user, token });
      // passwordMatch && sendToken(user, 200, res);
    } else {
      const enumerator = await Enumerator.findOne({ id }).select("+password");

      if (!enumerator) {
        res.status(401).json({
          message: "Invalid Id or password, please try again",
        });
      }

      if (enumerator.disabled) {
        res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }

      const passwordMatch = enumerator.isPasswordMatch(password);
      const token = sendToken(enumerator);

      res.status(200).json({ user: enumerator, token });
      // passwordMatch && sendToken(enumerator, 200, res);
    }
  } catch (error) {
    res.status(401).json({ message: error.message, stack: error.stack });
  }
};

// Forgot password => api/v1/password/reset ****
export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({ message: "User not found" });
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
      subject: "DMS Password Reset",
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
    res.status(500).json({ message: error.message });
  }
};

// Reset password => api/v1/password/reset/:token ****
export const resetPassword = async (req, res) => {
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
};

// Get currently logged in user profile => api/v1/me ****
export const getUserProfile = async (req, res) => {
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
};

// Update password => api/v1/password/update ****
export const updatePassword = async (req, res) => {
  const user = await User.findById(req.user.id).select("+password");

  // Verify old password is correct
  const VerifyPassword = await user.isPasswordMatch(req.body.oldPassword);

  if (!VerifyPassword) {
    return next(new ErrorHandler("Old password does not match", 400));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
};

// Update user details/profile => api/v1/me/update ****
export const updateUserProfile = async (req, res) => {
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
};

// Logout user => api/v1/logout ****
export const logoutUser = async (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

// Admin Routes ********

// Get all users => api/v1/admin/users ****
export const getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
};

// Get all teamlead => api/v1/admin/team_lead ****
export const getAllTeamLead = async (req, res) => {
  const users = await User.find({ role: "team_lead", disabled: false });

  res.status(200).json({
    success: true,
    users,
  });
};

// Get all enumerators api/v1/enumerators
export const getAllEnumerators = async (req, res, next) => {
  const query = {};
  if (req?.user?.role === "team_lead") {
    query.user = req.user._id;
  }
  const enumerators = await Enumerator.find(query);
  const totalEnumerators = await Enumerator.countDocuments({
    user: req.user._id,
    disabled: false,
  });
  const newlyAdded = await Enumerator.countDocuments({
    created_at: { $gte: startOfMonth, $lt: endOfMonth },
    user: req.user._id,
  });

  res.status(200).json({
    message: "success",
    enumerators,
    totalEnumerators,
    newlyAdded,
  });
};

// Get specific user => api/v1/admin/users/:id ****
export const getOneUser = async (req, res) => {
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
};

// Get specific Enumerator => api/v1/admin/Enumerator/:id ****
export const getOneEnumerator = async (req, res) => {
  const user = await Enumerator.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`Enumerator with id ${req.params.id} does not exist`)
    );
  }
  const totalSubmision = await Form.countDocuments({ created_by: user._id });

  res.status(200).json({
    success: true,
    user,
    totalSubmision,
  });
};

// Update user details/profile ADMIN => api/v1/admin/user/:id ****
export const updateUserProfileAdmin = async (req, res) => {
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
};

// Update user details/profile ADMIN => api/v1/admin/user/:id ****
export const updateEnumeratorProfileAdmin = async (req, res) => {
  try {
    const newUserDetails = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      id: req.body.id,
      state: req.body.state,
      LGA: req.body.LGA,
    };

    const user = await Enumerator.findByIdAndUpdate(
      req.params.id,
      newUserDetails,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// reassign lga to teamLead => api/v1/admin/team_lead/assign_lga/:id
export const assignLga = async (req, res) => {
  try {
    const { lga } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
    }
    lga.map((item) => {
      user.LGA.push(item);
    });
    res.status(200).json({ message: "user LGA assigned successfully", User });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable enumerator ADMIN => api/v1/admin/enumerator/:id/disable ****
export const disableEnumerator = async (req, res) => {
  const enumerator = await Enumerator.findByIdAndUpdate(
    req.params.id,
    { disabled: true },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!enumerator) {
    return next(new ErrorHandler(`User with id ${req.params.id} not found`));
  }

  res.status(200).json({
    success: true,
    message: "enumerator disabled",
  });
};

// Disable user ADMIN => api/v1/admin/enumerator/:id/disable ****
export const disableUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { disabled: true },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  if (!user) {
    return next(new ErrorHandler(`User with id ${req.params.id} not found`));
  }

  res.status(200).json({
    success: true,
    message: "user disabled",
  });
};

// Seed super admin => api/v1/seed
export const seedSuperAdmin = async (req, res) => {
  try {
    const { firstName, lastName, password, email } = req.body;
    const id = generateId();

    const user = await User.create({
      id,
      firstName,
      lastName,
      email,
      password,
      role: "super_admin",
    });
    // sendToken(user, 200, res);
    const token = sendToken(user);

    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      stack: error.stack,
    });
  }

  // if (!user) {
  //   return next(new ErrorHandler("Something went wrong", 400));
  // }

  //
};
