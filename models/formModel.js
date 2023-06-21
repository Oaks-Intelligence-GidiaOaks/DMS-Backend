import mongoose from "mongoose";

import { Schema, model } from "mongoose";

const FormSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    required: true,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  region: { type: String, required: true },
  approved: { type: Number, default: 0 },
  team_lead_id: { type: String, required: true },
  foodItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  accomodations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accomodation",
    },
  ],
  transports: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
    },
  ],
  electricity: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Electricity",
    },
  ],
  others: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OtherProduct",
    },
  ],
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  clothings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
    },
  ],
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

export default model("Form", FormSchema);
