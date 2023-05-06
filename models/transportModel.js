import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transportSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  start: { type: String, required: true },
  end: { type: String, required: true },
  mode: { type: String, required: true },
  cost: { type: Number, required: true },
  created_at: { type: Date, default: new Date() },
});

export default model("Transport", transportSchema);
