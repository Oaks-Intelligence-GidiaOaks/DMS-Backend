import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accomodationSchema = new Schema({
  type: { type: String, required: true },
  rooms: { type: Number, required: true },
  price: { type: Number, required: true },
});

export default model("Accomodation", accomodationSchema);
