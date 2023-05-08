import express from "express";
import {
  createUser,
  createEnumerator,
  forgotPassword,
  getAllUsers,
  getOneUser,
  getUserProfile,
  loginUser,
  logoutUser,
  resetPassword,
  updatePassword,
  updateUserProfile,
  updateUserProfileAdmin,
  deleteUser,
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/new", createUser);
router.post("/enumerator/new", createEnumerator);
router.post("/login", loginUser);

router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

router.get("/logout", logoutUser);

router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/me/update", isAuthenticatedUser, updateUserProfile);
router.put("/password/update", isAuthenticatedUser, updatePassword);
 
router.get("/admin/users", isAuthenticatedUser, authorizeRoles('superadmin'), getAllUsers)
router.get("/admin/user/:id", isAuthenticatedUser, authorizeRoles('superadmin'), getOneUser)
router.put("/admin/user/:id", isAuthenticatedUser, authorizeRoles('superadmin'), updateUserProfileAdmin)
router.delete("/admin/user/:id", isAuthenticatedUser, authorizeRoles('superadmin'), deleteUser)

export default router;
