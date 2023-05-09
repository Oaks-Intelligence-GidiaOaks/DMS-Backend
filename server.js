import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import errorMiddleWare from "./middlewares/error.js";
import { connectDb } from "./configs/connectDb.js";
import formRoutes from "./routes/formRoutes.js";
import formResponseRoutes from "./routes/formResponseRoute.js";
import userRoute from "./routes/userRoutes.js";
import enumeratorRoute from "./routes/enumeratorRoutes.js";

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
const PORT = process.env.PORT || 8000;
const ENV = process.env.ENV;

// initialization
const app = express();

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  credentials: true,
};
// middlewares
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));

// routes
app.use("/api/v1/form", formRoutes);
app.use("/api/v1/form_response", formResponseRoutes);
app.use("/api/v1/", userRoute);
app.use("/api/v1/", enumeratorRoute);

// Error handling middleware
app.use(errorMiddleWare);

app.listen(PORT, () =>
  console.log(`App is listening on port ${PORT} in ${ENV} mode`)
);
