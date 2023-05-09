import mongoose from "mongoose";

const { Schema, model } = mongoose;

const electricitySchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    // required: true,
  },
  hours_per_week: { type: Number, required: true },
  created_at: { type: Date, default: new Date() },
});

export default model("Electricity", electricitySchema);
