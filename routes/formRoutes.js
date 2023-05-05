import express from "express";
import { addFormData, getFormData } from "../controllers/formController.js";

const router = express.Router();

router.get("/form_data", getFormData);
router.post("/add_data", addFormData);

export default router;