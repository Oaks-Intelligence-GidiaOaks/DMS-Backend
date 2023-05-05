import express from "express";
import bodyParser from "body-parser";
import errorMiddleWare from "./middlewares/error.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDb } from "./configs/connectDb.js";
import formRoutes from "./routes/formRoutes.js";

// env config
dotenv.config({
  path: "configs/config.env",
});

connectDb(process.env.MONGODB);

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(`ERROR: ${err.stack}`);
  console.log("shutting down due to uncaughtException");
  process.exit(1);
});

// Handle promise rejections
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("shutting down server due to unhandledRejection");
  server.close(() => {
    process.exit(1);
  });
});

// port/environment
const PORT = process.env.PORT || 5000;
const ENV = process.env.ENV;

// initialization
const app = express();

// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// routes
app.use("/form", formRoutes);

// Error handling middleware
app.use(errorMiddleWare);

app.listen(PORT, () =>
  console.log(`App is listening on port ${PORT} in ${ENV} mode`)
);
