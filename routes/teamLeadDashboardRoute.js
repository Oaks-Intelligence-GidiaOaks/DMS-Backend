import express from "express";
import {
  getPriceFluctuation,
  getSubmisionRate,
} from "../controllers/teamLeadDashboardController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/price_fluctuation", isAuthenticatedUser, getPriceFluctuation);
router.get("/submission_rate", isAuthenticatedUser, getSubmisionRate);

export default router;
