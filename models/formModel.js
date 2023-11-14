import mongoose from "mongoose";
import AuditTrail from "./auditTrailModel.js";

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
  region: { type: String },
  approved: { type: Number, default: 0 },
  team_lead_id: { type: String, required: true },
  flagged: {
    type: Boolean,
    default: false,
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
  clothings: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Clothing",
    },
  ],
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

// populate audit trail
FormSchema.pre("save", function (next) {
  if (this.isNew) {
    // Document is new, store "create" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "Form",
      documentId: this._id,
      action: "create",
    });
    auditTrailEntry.save();
  } else {
    // Document is being updated, store "update" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "Form",
      documentId: this._id,
      action: "update",
    });
    auditTrailEntry.save();
  }
  next();
});

export default model("Form", FormSchema);
