import mongoose from "mongoose";

const { Schema, model } = mongoose;

const questionSchema = new Schema({
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    // required: true,
  },
  question: { type: String, required: true },
  response: { type: Boolean, required: true },
  comment: { type: String },
  note: { type: String },
  created_at: { type: Date, default: new Date() },
});

export default model("Question", questionSchema);
