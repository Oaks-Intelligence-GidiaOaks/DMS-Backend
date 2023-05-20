import express from "express";
import { getPriceFluctuation } from "../controllers/teamLeadDashboardController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/price_fluctuation", isAuthenticatedUser, getPriceFluctuation);

export default router;
