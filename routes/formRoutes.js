import express from "express";
import {
  addFormData,
  getFormData,
  //   clearDb,
} from "../controllers/formController.js";
import { isAuthenticatedEnumerator } from "../middlewares/auth.js";

const router = express.Router();

router.get("/form_data", getFormData);
// router.delete("/clear_db", clearDb);

router.post("/add_data", isAuthenticatedEnumerator, addFormData);

export default router;
