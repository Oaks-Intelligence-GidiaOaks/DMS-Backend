import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionSchema = new Schema({
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
  region: { type: String },
  approved: { type: Number, default: 0 },
  team_lead_id: { type: String, required: true },
  government_project: { type: Boolean, required: true },
  comment_for_government_project: { type: String },
  crime_report: { type: Boolean, required: true },
  comment_for_crime_report: { type: String },
  accidents: { type: Boolean, required: true },
  comment_for_accidents: { type: String },
  commentImage: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  note: { type: String },
  team_lead_note: { type: String },
  created_at: { type: Date, default: new Date() },
  updated_at: { type: Date, default: new Date() },
});

export default model("Question", questionSchema);
