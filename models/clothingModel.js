import mongoose from "mongoose";

const { Schema, model } = mongoose;

const clothingSchema = new Schema({
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
  category: { type: String, required: true },
  sub_category: { type: String, required: true },
  size: { type: String, required: true },
  price: { type: Number, required: true },
  flagged: {
    type: Boolean,
    default: false,
  },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

export default model("Clothing", clothingSchema);
