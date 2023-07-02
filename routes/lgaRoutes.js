import express from "express";
import {
  getLgaRoute,
  createLgaRoute,
  updateLgaRoute,
  deleteLgaRoute,
} from "../controllers/lgaRouteController.js";
import {
  isAuthenticatedUser,
  isAuthenticatedEnumerator,
} from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/lga_routes",
  isAuthenticatedUser,
  isAuthenticatedEnumerator,
  getLgaRoute
);
router.post("/lga_routes", isAuthenticatedUser, createLgaRoute);
router.patch("/lga_routes/:id", isAuthenticatedUser, updateLgaRoute);
router.delete("/lga_routes/:id", isAuthenticatedUser, deleteLgaRoute);

export default router;
