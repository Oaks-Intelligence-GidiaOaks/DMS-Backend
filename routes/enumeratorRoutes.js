import express from "express";
import {
  getEnumeratorProfile,
  loginEnumerator,
  logoutEnumerator,
} from "../controllers/enumeratorController.js";

import { isAuthenticatedUser } from "../middlewares/auth.js";


const router = express.Router();

router.post("/enumerator/login", loginEnumerator);
router.get("/enumerator/logout", logoutEnumerator);

router.get("/enumerator/profile", isAuthenticatedUser, getEnumeratorProfile);

export default router;
