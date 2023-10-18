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
import { createAuditLog } from "./auditLogController.js";

const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// Get the start and end timestamps of the current month
const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

// Create team lead/admin api/v1/user/new ****
export const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      role,
      states,
      phoneNumber,
      identity,
      identityType,
      identityImage,
      avatar,
      LGA,
    } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
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

    const resultUserAvatar = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const resultIdentityImage = await cloudinary.v2.uploader.upload(
      identityImage,
      {
        folder: "government_id",
        width: 150,
        crop: "scale",
      }
    );

    const newUser = await User.create({
      id,
      firstName,
      lastName,
      email,
      role,
      phoneNumber,
      password: "123456",
      identityType,
      identity,
      identityImage: {
        public_id: resultIdentityImage.public_id,
        url: resultIdentityImage.secure_url,
      },
      avatar: {
        public_id: resultUserAvatar.public_id,
        url: resultUserAvatar.secure_url,
      },
      states,
      LGA,
    });

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
      identityImage,
      state,
      LGA,
    } = req.body;

    const enumerator = await Enumerator.findOne({ email });

    if (enumerator) {
      return res.status(409).json({
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

    // Handle cloudinary upload
    const resultIdentityImage = await cloudinary.v2.uploader.upload(
      identityImage,
      {
        folder: "government_id",
        width: 150,
        crop: "scale",
      }
    );

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
        public_id: resultIdentityImage.public_id,
        url: resultIdentityImage.secure_url,
      },
      state,
      LGA,
      user: req.user._id,
    });

    const user = await User.findById(req.user._id);
    user.enumerators.push(newEnumerator._id);
    await user.save();

    sendToken(newEnumerator, 200, res);

    res.status(200).json({
      success: true,
      newEnumerator,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Login user api/v1/login ****
export const loginUser = async (req, res) => {
  const ipAddress = req.socket.remoteAddress;
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
        return res.status(401).json({
          message: "Invalid Id or password, please try again",
        });
      }

      if (user.disabled) {
        return res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }

      const passwordMatch = await user.isPasswordMatch(password);
      const token = passwordMatch && sendToken(user);

      if (passwordMatch) {
        const logData = {
          title: "Login",
          description: `User logged in`,
          name: user.firstName,
          id: user.id,
          ip_address: ipAddress,
        };

        await createAuditLog(logData);
        res.status(200).json({ user, token });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid password, please try again",
        });
      }
      // passwordMatch && sendToken(user, 200, res);
    } else {
      const enumerator = await Enumerator.findOne({ id }).select("+password");

      if (!enumerator) {
        return res.status(401).json({
          message: "Invalid Id or password, please try again",
        });
      }

      if (enumerator.disabled) {
        return res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }

      const passwordMatch = await enumerator.isPasswordMatch(password);
      const token = passwordMatch && sendToken(enumerator);

      if (passwordMatch) {
        const logData = {
          title: "Login",
          description: `Enumerator logged in`,
          name: enumerator.firstName,
          id: enumerator.id,
          ip_address: ipAddress,
        };

        await createAuditLog(logData);
        res.status(200).json({ user: enumerator, token });
      } else {
        res.status(401).json({
          success: false,
          message: "Invalid password, please try again",
        });
      }
    }
  } catch (error) {
    res.status(401).json({ message: error.message, stack: error.stack });
  }
};

// test Login user api/v1/test_login ****
export const testLoginUser = async (req, res) => {
  const ipAddress = req.socket.remoteAddress;
  try {
    const { id } = req.body;

    // find user in database
    const user = await User.findOne({ id });

    if (user) {
      // return eror if user/enumerator dont exist in db
      if (!user) {
        return res.status(401).json({
          message: "Invalid Id, please try again",
        });
      }

      if (user.disabled) {
        return res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }
      const token = sendToken(user);
      const logData = {
        title: "Login",
        description: `User logged in`,
        name: user.firstName,
        id: user.id,
        ip_address: ipAddress,
      };

      await createAuditLog(logData);
      res.status(200).json({ user, token });
    } else {
      const enumerator = await Enumerator.findOne({ id });

      if (!enumerator) {
        return res.status(401).json({
          message: "Invalid Id or password, please try again",
        });
      }

      if (enumerator.disabled) {
        return res.status(401).json({
          message:
            "Your account has been disabled. Please contact the administrator for assistance",
        });
      }

      const token = sendToken(enumerator);
      res.status(200).json({ user: enumerator, token });
    }
  } catch (error) {
    res.status(401).json({ message: error.message, stack: error.stack });
  }
};

// Forgot password => api/v1/password/reset ****
// export const forgotPassword = async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   // Get reset password token
//   const resetPasswordToken = user.getResetPasswordToken();
//   await user.save({ validateBeforeSave: false });

//   const resetPasswordUrl = `${req.protocol}://${req.get(
//     "host"
//   )}/api/v1/password/reset/${resetPasswordToken}`;

//   // email message
//   const message = `Click this link to reset your password:\n\n${resetPasswordUrl}\n\nIf your have not requested a password reset please ignore.`;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "DMS Password Reset",
//       message,
//     });

//     res.status(200).json({
//       success: true,
//       message: `Email sent successfully to ${user.email}`,
//     });
//   } catch (error) {
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     // save user again
//     await user.save({ validateBeforeSave: false });
//     res.status(500).json({ message: error.message });
//   }
// };

// Reset password => api/v1/password/reset ****
export const resetPassword = async (req, res) => {
  //  find user/enumerator by id
  try {
    const { id } = req.body;

    const user = await User.findOne({ id }).select("+password");

    if (user) {
      user.password = "123456";
      user.firstUse = true;
      user && (await user.save());

      res.status(200).json({
        message: "pasword reset successful",
      });
    } else {
      const enumerator = await Enumerator.findOne({ id }).select("+password");

      if (enumerator) {
        enumerator.password = "123456";
        enumerator.firstUse = true;
        enumerator && (await enumerator.save());

        res.status(200).json({
          message: "pasword reset successful",
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }

  // await user.save();
  // sendToken(user, 200, res);
};

// Get currently logged in user profile => api/v1/me ****
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.disabled) {
      return res.status(401).json({
        message:
          "Your account has been disabled. Please contact the administrator for assistance",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get currently logged in enumerator profile => api/v1/me ****
export const getEnumeratorProfile = async (req, res) => {
  try {
    const user = await Enumerator.findById(req.enumerator._id);

    if (user.disabled) {
      return res.status(401).json({
        message:
          "Your account has been disabled. Please contact the administrator for assistance",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update password => api/v1/password/update ****
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid user, please try again",
      });
    }
    // Verify old password is correct
    const VerifyPassword = await user.isPasswordMatch(oldPassword);

    if (!VerifyPassword) {
      return res.status(401).json({ message: "old password do not match" });
    }
    if (password !== confirmPassword) {
      return res.status(401).json({ message: "password do not match" });
    }
    user.password = password;
    user.firstUse = false;
    await user.save();
    res.status(200).json({ mesaage: "password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update password => api/v1/password/update ****
export const updateEnumeratorPassword = async (req, res) => {
  try {
    console.log(req.user);

    const { oldPassword, password, confirmPassword } = req.body;

    const enumerator = await Enumerator.findById(req.enumerator._id).select(
      "+password"
    );

    if (!enumerator) {
      return res.status(401).json({
        message: "Invalid user, please try again",
      });
    }
    const VerifyPassword = await enumerator.isPasswordMatch(oldPassword);

    if (!VerifyPassword) {
      return res.status(401).json({ message: "old password do not match" });
    }
    if (password !== confirmPassword) {
      return res.status(401).json({ message: "password do not match" });
    }
    enumerator.password = password;
    enumerator.firstUse = false;
    await enumerator.save();
    res.status(200).json({ mesaage: "password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user details/profile => api/v1/me/update ****
export const updateUserProfile = async (req, res) => {
  const resultUserAvatar = await cloudinary.v2.uploader.upload(
    req.body.avatar,
    {
      folder: "avatars",
      width: 150,
      crop: "scale",
      public_id: req.user.avatar.public_id,
    }
  );

  const newUserDetails = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    avatar: {
      public_id: resultUserAvatar.public_id,
      url: resultUserAvatar.secure_url,
    },
    states: req.body.states,
  };

  const user = await User.findByIdAndUpdate(req.user._id, newUserDetails, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
};

// Update enumerator details/profile => api/v1/enumerator/update ****
export const updateEnumeratorProfile = async (req, res) => {
  const resultIdentityImage = await cloudinary.v2.uploader.upload(
    identityImage,
    {
      folder: "government_id",
      width: 150,
      crop: "scale",
      public_id: req.enumerator.avatar.public_id,
    }
  );
  const newEnumeratorDetails = {
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    phoneNumber: req.body.phoneNumber,
    identity: req.body.identity,
    identityType: req.body.identityType,
    identityImage: {
      public_id: resultIdentityImage.public_id,
      url: resultIdentityImage.secure_url,
    },
    states: req.body.states,
    LGA: req.body.LGA,
  };

  const user = await Enumerator.findByIdAndUpdate(
    req.enumerator._id,
    newEnumeratorDetails,
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
  const query = {};
  if (req?.user?.role === "admin") {
    query.role = "team_lead";
    query.disabled = false;
  }
  if (req?.user?.role === "super_admin") {
    query.disabled = false;
  }
  const totalTeamLead = await User.countDocuments(query);
  const newlyAdded = await User.countDocuments({
    createdAt: { $gte: startOfMonth, $lt: endOfMonth },
    role: "team_lead",
  });
  const users = await User.find(query);

  res.status(200).json({
    success: true,
    users,
    totalTeamLead,
    newlyAdded,
  });
};

// Get all enumerators api/v1/enumerators
export const getAllEnumerators = async (req, res) => {
  try {
    const query = {};
    if (req?.user?.role === "team_lead") {
      query.LGA = {
        $in: req.user.LGA,
      };
      query.disabled = false;
    }
    const enumerators = await Enumerator.find(query);
    const totalEnumerators = await Enumerator.countDocuments({
      LGA: {
        $in: req.user.LGA,
      },
      disabled: false,
    });
    const newlyAdded = await Enumerator.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      LGA: {
        $in: req.user.LGA,
      },
    });

    res.status(200).json({
      message: "success",
      enumerators,
      totalEnumerators,
      newlyAdded,
    });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
  }
};
// Get all enumerators api/v1/enumerators
export const getAllTeamLeadEnumerators = async (req, res) => {
  try {
    const query = {};
    // if (req?.user?.role === "team_lead") {
    //   query.user = req.user._id;
    //   query.disabled = false;
    // }
    const teamLead = await User.findById(req.params.id);
    const enumerators = await Enumerator.find({
      LGA: {
        $in: teamLead.LGA,
      },
      disabled: false,
    });

    res.status(200).json({
      message: "success",
      enumerators,
    });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
  }
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
  try {
    const newUserDetails = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      id: req.body.id,
      states: req.body.states,
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
    const { lga, states } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
    }
    user.LGA = lga;
    user.states = states;
    await user.save();
    // lga.map((item) => {
    //   user.LGA.push(item);
    // });
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
  try {
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
      return res
        .status(401)
        .json({ message: `User with id ${req.params.id} not found` }); //next(new ErrorHandler(`User with id ${req.params.id} not found`));
    }

    res.status(200).json({
      success: true,
      message: "user disabled",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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

export const clearDb = async (req, res) => {
  try {
    await User.deleteMany({});
    await Enumerator.deleteMany({});
    res.status(200).json({ message: "users and enumerators cleared" });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
  }
};
