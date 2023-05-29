import express from "express";
import {
  getTeamLeadCount,
  getAdminPriceFluctuation,
  getEnumeratorsCount,
  getLGACount,
  getSubmissionCount,
} from "../controllers/adminDashboardController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/team_leads_count", isAuthenticatedUser, getTeamLeadCount);
router.get("/price_fluctuation", isAuthenticatedUser, getAdminPriceFluctuation);
router.get("/enumerators_count", isAuthenticatedUser, getEnumeratorsCount);
router.get("/lga_count", isAuthenticatedUser, getLGACount);
router.get("/submission_count", isAuthenticatedUser, getSubmissionCount);
// router.get("/yearly_enumerators", isAuthenticatedUser, getYearlyEnumerators);

export default router;
