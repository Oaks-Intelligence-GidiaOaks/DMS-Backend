import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionSchema = new Schema({
  question: { type: String, required: true },
  response: { type: Boolean, required: true },
  comment: { type: String },
});

export default model("Question", questionSchema);
