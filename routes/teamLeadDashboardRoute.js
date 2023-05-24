import express from "express";
import {
  getPriceFluctuation,
  getSubmisionRate,
  getEnumeratorsCount,
  getLGACount,
} from "../controllers/teamLeadDashboardController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/price_fluctuation", isAuthenticatedUser, getPriceFluctuation);
router.get("/submission_rate", isAuthenticatedUser, getSubmisionRate);
router.get("/enumerators_count", isAuthenticatedUser, getEnumeratorsCount);
router.get("/lga_count", isAuthenticatedUser, getLGACount);

export default router;
