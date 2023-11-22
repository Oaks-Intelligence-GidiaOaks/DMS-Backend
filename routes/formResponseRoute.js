import express from "express";
import {
  getOtherProducts,
  getPrevOtherProduct,
  flagOtherProduct,
  getQuestions,
  getPrevQuestion,
  flagQuestion,
  getElectricity,
  getPrevElectricity,
  flagElectricity,
  getAccomodation,
  getPrevAccomodation,
  flagAccomodation,
  getTransport,
  getPrevTransport,
  flagTransport,
  getFoodProduct,
  getPrevFoodProduct,
  flagFoodProduct,
  updateAccomodation,
  updateElectricity,
  updateFoodProduct,
  updateOtherProducts,
  updateQuestions,
  updateTransport,
  getClothingProduct,
  getPrevClothingProduct,
  flagClothingProduct,
  updateClothingProduct,
  reSubmitFoodProduct,
  resubmitAccomodation,
  resubmitClothingProduct,
  resubmitElectricity,
  resubmitOtherProduct,
  resubmitQuestion,
  resubmitTransport,
} from "../controllers/formResponseController.js";
import {
  getResponseTracker,
  approveResponse,
  getSubmissionTime,
  getAllSubmissionTime,
  getAdminResponseTracker,
} from "../controllers/responseTrackerController.js";
import { getMasterListData } from "../controllers/masterListController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

const router = express.Router();

router.get("/food_product", isAuthenticatedUser, getFoodProduct);
router.get("/prev_food_product", isAuthenticatedUser, getPrevFoodProduct);
router.patch("/food_product/:id", isAuthenticatedUser, updateFoodProduct);
router.patch("/flag_food_product/:id", isAuthenticatedUser, flagFoodProduct);
router.patch(
  "/resubmit_food_product/:id",
  isAuthenticatedUser,
  reSubmitFoodProduct
);

router.get("/prev_clothings", isAuthenticatedUser, getPrevClothingProduct);
router.get("/clothings", isAuthenticatedUser, getClothingProduct);
router.patch("/clothings/:id", isAuthenticatedUser, updateClothingProduct);
router.patch("/flag_clothings/:id", isAuthenticatedUser, flagClothingProduct);
router.patch(
  "/resubmit_clothings/:id",
  isAuthenticatedUser,
  resubmitClothingProduct
);

router.get("/transport", isAuthenticatedUser, getTransport);
router.get("/prev_transport", isAuthenticatedUser, getPrevTransport);
router.patch("/transport/:id", isAuthenticatedUser, updateTransport);
router.patch("/flag_transport/:id", isAuthenticatedUser, flagTransport);
router.patch("/resubmit_transport/:id", isAuthenticatedUser, resubmitTransport);

router.get("/accomodation", isAuthenticatedUser, getAccomodation);
router.get("/prev_accomodation", isAuthenticatedUser, getPrevAccomodation);
router.patch("/accomodation/:id", isAuthenticatedUser, updateAccomodation);
router.patch("/flag_accomodation/:id", isAuthenticatedUser, flagAccomodation);
router.patch(
  "/resubmit_accomodation/:id",
  isAuthenticatedUser,
  resubmitAccomodation
);

router.get("/electricity", isAuthenticatedUser, getElectricity);
router.get("/prev_electricity", isAuthenticatedUser, getPrevElectricity);
router.patch("/electricity/:id", isAuthenticatedUser, updateElectricity);
router.patch("/flag_electricity/:id", isAuthenticatedUser, flagElectricity);
router.patch(
  "/resubmit_electricity/:id",
  isAuthenticatedUser,
  resubmitElectricity
);

router.get("/questions", isAuthenticatedUser, getQuestions);
router.get("/prev_questions", isAuthenticatedUser, getPrevQuestion);
router.patch("/questions/:id", isAuthenticatedUser, updateQuestions);
router.patch("/flag_questions/:id", isAuthenticatedUser, flagQuestion);
router.patch("/resubmit_questions/:id", isAuthenticatedUser, resubmitQuestion);

router.get("/other_products", isAuthenticatedUser, getOtherProducts);
router.get("/prev_other_products", isAuthenticatedUser, getPrevOtherProduct);
router.patch("/other_products/:id", isAuthenticatedUser, updateOtherProducts);
router.patch("/flag_other_products/:id", isAuthenticatedUser, flagOtherProduct);
router.patch(
  "/resubmit_other_products/:id",
  isAuthenticatedUser,
  resubmitOtherProduct
);

router.get("/response_tracker", isAuthenticatedUser, getResponseTracker);
router.get(
  "/admin_response_tracker",
  isAuthenticatedUser,
  getAdminResponseTracker
);
router.get("/submission_time", isAuthenticatedUser, getSubmissionTime);
router.get("/all_submission_time", isAuthenticatedUser, getAllSubmissionTime);
router.post("/approve_response", isAuthenticatedUser, approveResponse);

router.get("/master_list_data", isAuthenticatedUser, getMasterListData);

export default router;
