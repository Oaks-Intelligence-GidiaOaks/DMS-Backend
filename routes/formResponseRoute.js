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
import { isAuthenticatedEnumerator } from "../middlewares/auth.js";

const router = express.Router();

router.get("/food_product", getFoodProduct);
router.patch("/food_product/:id", updateFoodProduct);
router.get("/transport", getTransport);
router.patch("/transport/:id", updateTransport);
router.get("/accomodation", getAccomodation);
router.patch("/accomodation/:id", updateAccomodation);
router.get("/electricity", getElectricity);
router.patch("/electricity/:id", updateElectricity);
router.get("/questions", getQuestions);
router.patch("/questions/:id", updateQuestions);
router.get("/other_products", getOtherProducts);
router.patch("/other_products/:id", updateOtherProducts);
router.get("/response_tracker", getResponseTracker);

export default router;
