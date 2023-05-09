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
  disableUser,
  seedSuperAdmin,
} from "../controllers/userController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/new", createUser);
router.post("/enumerator/new", isAuthenticatedUser, createEnumerator);
router.post("/login", loginUser);

router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

router.get("/logout", logoutUser);

router.get("/me", isAuthenticatedUser, getUserProfile);
router.put("/me/update", isAuthenticatedUser, updateUserProfile);
router.put("/password/update", isAuthenticatedUser, updatePassword);
 
router.get("/admin/users", getAllUsers)
router.get("/admin/user/:id", isAuthenticatedUser, authorizeRoles('super_admin'), getOneUser)
router.put("/admin/user/:id", isAuthenticatedUser, authorizeRoles('super_admin'), updateUserProfileAdmin)
router.put("/admin/user/:id", isAuthenticatedUser, authorizeRoles('super_admin'), disableUser)

router.post("/seed", seedSuperAdmin)

export default router;
