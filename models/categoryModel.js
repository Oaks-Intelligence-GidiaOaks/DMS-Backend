import mongoose from "mongoose";

const { Schema, model } = mongoose;

const categoryModel = new Schema({
  name: String,
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

export default model("Product", categoryModel);
