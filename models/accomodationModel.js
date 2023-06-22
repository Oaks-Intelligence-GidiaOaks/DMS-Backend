import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accomodationSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    // required: true,
  },
  type: { type: String },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  state: { type: String, required: true },
  lga: { type: String, required: true },
  region: { type: String },
  approved: { type: Number, default: 0 },
  team_lead_id: { type: String, required: true },
  rooms: { type: Number, required: true },
  price: { type: String, required: true },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

export default model("Accomodation", accomodationSchema);
