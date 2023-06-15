import express from "express";
import {
  createUser,
  createEnumerator,
  // forgotPassword,
  getAllUsers,
  getAllEnumerators,
  getOneUser,
  getUserProfile,
  loginUser,
  logoutUser,
  resetPassword,
  updatePassword,
  updateEnumeratorPassword,
  updateUserProfile,
  updateUserProfileAdmin,
  disableUser,
  disableEnumerator,
  seedSuperAdmin,
  getOneEnumerator,
  getAllTeamLead,
  assignLga,
  updateEnumeratorProfileAdmin,
  getAllTeamLeadEnumerators,
  getEnumeratorProfile,
  // clearDb,
} from "../controllers/userController.js";
import {
  isAuthenticatedUser,
  authorizeRoles,
  isAuthenticatedEnumerator,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/user/new", createUser);
router.post("/enumerator/new", isAuthenticatedUser, createEnumerator);
router.post("/login", loginUser);

// router.post("/password/forgot", forgotPassword);
router.put("/password/reset", isAuthenticatedUser, resetPassword);

router.get("/logout", logoutUser);

router.get("/me", isAuthenticatedUser, getUserProfile);
router.get("/enumerator/me", isAuthenticatedEnumerator, getEnumeratorProfile);
router.put("/me/update", isAuthenticatedUser, updateUserProfile);
router.put("/password/update", isAuthenticatedUser, updatePassword);
router.put(
  "/password/update/enumerator",
  isAuthenticatedEnumerator,
  updateEnumeratorPassword
);

router.get(
  "/admin/users",
  isAuthenticatedUser,
  authorizeRoles("super_admin"),
  getAllUsers
);
router.get(
  "/admin/team_lead",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "admin"),
  getAllTeamLead
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
  authorizeRoles("super_admin", "admin"),
  getOneUser
);
router.get(
  "/admin/enumerator/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "admin", "team_lead"),
  getOneEnumerator
);
router.put(
  "/admin/user/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "admin"),
  updateUserProfileAdmin
);
router.put(
  "/admin/enumerator/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "team_lead", "admin"),
  updateEnumeratorProfileAdmin
);
router.get(
  "/admin/team_lead_enumerators/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "team_lead", "admin"),
  getAllTeamLeadEnumerators
);
router.put(
  "/admin/user/disable/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "admin"),
  disableUser
);
router.put(
  "/admin/team_lead/assign_lga/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "admin"),
  assignLga
);
router.put(
  "/admin/enumerator/disable/:id",
  isAuthenticatedUser,
  authorizeRoles("super_admin", "team_lead", "admin"),
  disableEnumerator
);

router.post("/seed", seedSuperAdmin);
// router.delete("/clear_db", clearDb);

export default router;
