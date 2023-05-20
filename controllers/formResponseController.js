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
import APIQueries from "../utils/apiQueries.js";

function getLastWeeksDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
}

// get food product api/v1/form_response/food_product
export const getFoodProduct = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    nameFilter = "",
    brandFilter = "",
    priceFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (nameFilter !== "") {
    query.name = nameFilter;
  }
  if (brandFilter !== "") {
    query.brand = brandFilter;
  }
  if (priceFilter !== "") {
    query.price = priceFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;

  try {
    const totalCount = await Product.countDocuments(query);
    const data = await Product.find(query)
      .populate({
        path: "created_by",
      })
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update food product api/v1/form_response/food_product/id
export const updateFoodProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, brand } = req.body;
    await Product.findByIdAndUpdate(
      { _id: id },
      {
        name,
        brand,
        price,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Food Product updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get transport api/v1/form_response/transport
export const getTransport = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    routeFilter = "",
    modeFilter = "",
    costFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (routeFilter !== "") {
    query.route = routeFilter;
  }
  if (modeFilter !== "") {
    query.mode = modeFilter;
  }
  if (costFilter !== "") {
    query.cost = costFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };
  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    const totalCount = await Transport.countDocuments(query);
    const data = await Transport.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});

//update Transport api/v1/form_response/transport/id
export const updateTransport = async (req, res) => {
  try {
    const { id } = req.params;
    const { route, mode, cost } = req.body;
    await Transport.findByIdAndUpdate(
      { _id: id },
      {
        route,
        mode,
        cost,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Transport updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get accomodation  api/v1/form_response/accomodation
export const getAccomodation = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    typeFilter = "",
    roomsFilter = "",
    prizeFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (typeFilter !== "") {
    query.type = typeFilter;
  }
  if (roomsFilter !== "") {
    query.rooms = roomsFilter;
  }
  if (prizeFilter !== "") {
    query.prize = prizeFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    const totalCount = await Accomodation.countDocuments(query);
    const data = await Accomodation.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});

//update accomodation api/v1/form_response/transport/id
export const updateAccomodation = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, price, rooms } = req.body;
    await Accomodation.findByIdAndUpdate(
      { _id: id },
      {
        type,
        price,
        rooms,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Accomodation updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get electricity api/v1/form_response/electricity
export const getElectricity = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    hourPerWeekFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (hourPerWeekFilter !== "") {
    query.hours_per_week = hourPerWeekFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    const totalCount = await Electricity.countDocuments(query);
    const data = await Electricity.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});

//update electricity api/v1/form_response/electricity/id
export const updateElectricity = async (req, res) => {
  try {
    const { id } = req.params;
    const { hours_per_week } = req.body;
    await Electricity.findByIdAndUpdate(
      { _id: id },
      {
        hours_per_week,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Electricity updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get questions api/v1/form_response/questions
export const getQuestions = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    governmentProjectFilter = "",
    crimeReportFilter = "",
    accidentFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (accidentFilter !== "") {
    query.accidents = accidentFilter;
  }
  if (crimeReportFilter !== "") {
    query.crime_report = crimeReportFilter;
  }
  if (governmentProjectFilterFilter !== "") {
    query.government_project = governmentProjectFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    const totalCount = await Question.countDocuments(query);
    const data = await Question.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});

//update questions api/v1/form_response/questions/id
export const updateQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      government_project,
      comment_for_government_project,
      crime_report,
      comment_for_crime_report,
      accidents,
      comment_for_accidents,
      note,
    } = req.body;
    await Question.findByIdAndUpdate(
      { _id: id },
      {
        government_project,
        comment_for_government_project,
        crime_report,
        comment_for_crime_report,
        accidents,
        comment_for_accidents,
        note,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Questions updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get other product api/v1/form_response/other_products
export const getOtherProducts = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    nameFilter = "",
    brandFilter = "",
    priceFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (nameFilter !== "") {
    query.name = nameFilter;
  }
  if (brandFilter !== "") {
    query.brand = brandFilter;
  }
  if (priceFilter !== "") {
    query.price = priceFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    const totalCount = await OtherProduct.countDocuments(query);
    const data = await OtherProduct.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});

//update other products api/v1/form_response/other_products/id
export const updateOtherProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, brand } = req.body;
    await OtherProduct.findByIdAndUpdate(
      { _id: id },
      {
        name,
        brand,
        price,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Other Products updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
