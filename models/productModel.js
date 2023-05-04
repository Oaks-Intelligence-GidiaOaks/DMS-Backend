import mongoose from "mongoose";

const { Schema, model } = mongoose;

const productSchema = new Schema({
  name: String,
  price: Number,
  brand: String,
});

export default model("Product", productSchema)