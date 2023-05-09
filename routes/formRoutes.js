import express from "express";
import { addFormData, getFormData } from "../controllers/formController.js";
import { isAuthenticatedEnumerator } from "../middlewares/auth.js";

const router = express.Router();

router.get("/form_data", getFormData);

router.post("/add_data", isAuthenticatedEnumerator, addFormData);

export default router;
