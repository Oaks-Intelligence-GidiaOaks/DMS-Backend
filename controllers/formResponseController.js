import mongoose from "mongoose";
import Form from "../models/formModel.js";
import Product from "../models/productModel.js";
import OtherProduct from "../models/otherProductsModel.js";
import Accomodation from "../models/accomodationModel.js";
import Electricity from "../models/electricityModel.js";
import Transport from "../models/transportModel.js";
import Question from "../models/questionModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";

// get food product api/v1/form_response/food_product
export const getFoodProduct = catchAsyncErrors(async (req, res, next) => {
  // const { searchQuery = "", page = 1 } = req.query;

  // const query = {};
  // if (searchQuery) {
  //   query.name = { $regex: searchQuery, $options: "i" };
  //   query.brand = { $regex: searchQuery, $options: "i" };
  //   query.price = { $regex: searchQuery, $options: "i" };
  // }
  // const startIndex = (Number(page) - 1) * 8;
  // const count = await Product.countDocuments({ query });
  try {
    const data = await Product.find().populate("created_by");

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get food product api/v1/form_response/transport
export const getTransport = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Transport.find().populate("created_by");

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get food product api/v1/form_response/accomodation
export const getAccomodation = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Accomodation.find().populate("created_by");

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get food product api/v1/form_response/electricity
export const getElectricity = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Electricity.find().populate("created_by");
    // const filteredData = data.filter((item) => {
    //   return item.created_by.state === "Lagos";
    // });

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get food product api/v1/form_response/questions
export const getQuestions = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Question.find().populate("created_by");

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

// get food product api/v1/form_response/other_products
export const getOtherProducts = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await OtherProduct.find().populate("created_by");

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
