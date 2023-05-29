import express from "express";
import {
  createUser,
  createEnumerator,
  forgotPassword,
  getAllUsers,
  getAllEnumerators,
  getOneUser,
  getUserProfile,
  loginUser,
  logoutUser,
  resetPassword,
  updatePassword,
  updateUserProfile,
  updateUserProfileAdmin,
  disableUser,
  disableEnumerator,
  seedSuperAdmin,
  getOneEnumerator,
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

router.get(
  "/admin/users",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  getAllUsers
);
router.get(
  "/admin/enumerators",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "team_lead", "admin"),
  getAllEnumerators
);
router.get(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  getOneUser
);
router.get(
  "/admin/enumerator/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  getOneEnumerator
);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  updateUserProfileAdmin
);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  disableUser
);
router.put(
  "/admin/enumerator/disable/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "team_lead", "admin"),
  disableEnumerator
);

router.post("/seed", seedSuperAdmin);

export default router;
