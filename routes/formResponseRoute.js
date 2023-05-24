import express from "express";
import {
  getOtherProducts,
  getQuestions,
  getElectricity,
  getAccomodation,
  getTransport,
  getFoodProduct,
  updateAccomodation,
  updateElectricity,
  updateFoodProduct,
  updateOtherProducts,
  updateQuestions,
  updateTransport,
} from "../controllers/formResponseController.js";
import { getResponseTracker } from "../controllers/responseTrackerController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/food_product", isAuthenticatedUser, getFoodProduct);
router.patch("/food_product/:id", isAuthenticatedUser, updateFoodProduct);
router.get("/transport", isAuthenticatedUser, getTransport);
router.patch("/transport/:id", isAuthenticatedUser, updateTransport);
router.get("/accomodation", isAuthenticatedUser, getAccomodation);
router.patch("/accomodation/:id", isAuthenticatedUser, updateAccomodation);
router.get("/electricity", isAuthenticatedUser, getElectricity);
router.patch("/electricity/:id", isAuthenticatedUser, updateElectricity);
router.get("/questions", isAuthenticatedUser, getQuestions);
router.patch("/questions/:id", isAuthenticatedUser, updateQuestions);
router.get("/other_products", isAuthenticatedUser, getOtherProducts);
router.patch("/other_products/:id", isAuthenticatedUser, updateOtherProducts);
router.get("/response_tracker", isAuthenticatedUser, getResponseTracker);

export default router;
