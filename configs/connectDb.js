import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({
  path: "backend/configs/config.env",
});


mongoose.set('strictQuery', false);
 
export const connectDb = (URI) => {
  try {
    mongoose.connect(URI);
    console.log("connection to database is sucessful!");
  } catch (err) {
    console.log("Data base connection failed");
  }
  return {}
};
