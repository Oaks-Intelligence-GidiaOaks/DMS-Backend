import mongoose from "mongoose";

const { Schema, model } = mongoose;

const otherProductSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    // required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  brand: { type: String },
  created_at: { type: Date, default: new Date() },
});

export default model("OtherProduct", otherProductSchema);
