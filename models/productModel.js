import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    // required: true,
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
  name: { type: String, required: true },
  price: { type: String, required: true },
  brand: { type: String, required: true },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

export default model("Product", productSchema);
