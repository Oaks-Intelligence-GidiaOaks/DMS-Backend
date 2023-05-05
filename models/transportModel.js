import mongoose from "mongoose";

const { Schema, model } = mongoose;

const transportSchema = new Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  mode: { type: String, required: true },
  cost: { type: Number, required: true },
});

export default model("Transport", transportSchema);
