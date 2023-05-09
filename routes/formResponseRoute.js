import express from "express";
import {
  getOtherProducts,
  getQuestions,
  getElectricity,
  getAccomodation,
  getTransport,
  getFoodProduct,
} from "../controllers/formResponseController.js";
import { isAuthenticatedEnumerator } from "../middlewares/auth.js";

const router = express.Router();

router.get("/food_product", getFoodProduct);
router.get("/transport", getTransport);
router.get("/accomodation", getAccomodation);
router.get("/electricity", getElectricity);
router.get("/questions", getQuestions);
router.get("/other_products", getOtherProducts);

export default router;
