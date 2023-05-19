import mongoose from "mongoose";

const { Schema, model } = mongoose;

const lgaRouteSchema = new Schema({
  lga: { type: String, required: true },
  routes: [],
});

export default model("LGARoute", lgaRouteSchema);
