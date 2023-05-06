import mongoose from "mongoose";

import { Schema, model } from "mongoose";

const FormSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
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
  created_at: { type: Date, default: new Date() },
});

export default model("Form", FormSchema);
