import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accomodationSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Enumerator",
    // required: true,
  },
  type: { type: String, required: true },
  // rooms: { type: Number, required: true },
  price: { type: Number, required: true },
  created_at: { type: Date, default: new Date() },
});

export default model("Accomodation", accomodationSchema);
