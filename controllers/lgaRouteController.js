import mongoose from "mongoose";
import LGARoute from "../models/lgaRouteModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";

// get lga routes api/v1/lga_routes
export const getLgaRoute = async (req, res) => {
  try {
    const data = await LGARoute.find().populate("routes");
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//create Lga route api/v1/lga_routes
export const createLgaRoute = async (req, res) => {
  try {
    const { lga, routes } = req.body;

    const data = await new LGARoute({
      lga,
      routes,
    }).save();

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//update lga route api/v1/lga_routes/id
export const updateLgaRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { lga, routes } = req.body;
    const itemToEdit = await LGARoute.findById({ _id: id });
    if (!itemToEdit) throw new Error("LGA route not found");
    await LGARoute.findByIdAndUpdate(
      { _id: id },
      {
        lga,
        routes,
      }
    );

    res.status(200).json({ message: "LGA route updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//delete lga route api/v1/lga_routes/id
export const deleteLgaRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const itemToDelete = await LGARoute.findById({ _id: id });
    if (!itemToDelete) throw new Error("LGA route not found");

    itemToDelete.delete();

    res.status(200).json({ message: "LGA route deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
