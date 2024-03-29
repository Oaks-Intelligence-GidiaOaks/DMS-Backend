import express from "express";
// import { getAuditLog } from "../controllers/auditTrailController.js";
import { getAuditLog } from "../controllers/auditLogController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", isAuthenticatedUser, getAuditLog);

export default router;
