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
import "../utils/dateUtils.js";

// function getLastWeeksDate() {
//   const now = new Date();
//   return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
// }
const currentWeek = new Date().getWeek();

// get food product api/v1/form_response/food_product
export const getFoodProduct = async (req, res) => {
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

  const additionalQueryParams = {};
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (nameFilter !== "") {
    additionalQueryParams.name = nameFilter;
  }
  if (brandFilter !== "") {
    additionalQueryParams.brand = brandFilter;
  }
  if (priceFilter !== "") {
    additionalQueryParams.price = priceFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;

  try {
    const totalCount = await Product.countDocuments(query);
    const data = await Product.find(query).populate({
      path: "created_by",
    });
    // .skip(skip)
    // .limit(20);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
export const getTransport = async (req, res) => {
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

  const additionalQueryParams = {};
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (routeFilter !== "") {
    additionalQueryParams.route = routeFilter;
  }
  if (modeFilter !== "") {
    additionalQueryParams.mode = modeFilter;
  }
  if (costFilter !== "") {
    additionalQueryParams.cost = costFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  // query.created_at = { $gte: getLastWeeksDate() };
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };
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
};

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
export const getAccomodation = async (req, res) => {
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

  const additionalQueryParams = {};
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (typeFilter !== "") {
    additionalQueryParams.type = typeFilter;
  }
  if (roomsFilter !== "") {
    additionalQueryParams.rooms = roomsFilter;
  }
  if (prizeFilter !== "") {
    additionalQueryParams.prize = prizeFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  // query.created_at = { $gte: getLastWeeksDate() };
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };

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
};

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
export const getElectricity = async (req, res) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    hourPerWeekFilter = "",
    page,
  } = req.query;

  const additionalQueryParams = {};
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (hourPerWeekFilter !== "") {
    additionalQueryParams.hours_per_week = hourPerWeekFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  // query.created_at = { $gte: getLastWeeksDate() };
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };

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
};

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
export const getQuestions = async (req, res) => {
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
  const additionalQueryParams = {};

  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (accidentFilter !== "") {
    additionalQueryParams.accidents = accidentFilter;
  }
  if (crimeReportFilter !== "") {
    additionalQueryParams.crime_report = crimeReportFilter;
  }
  if (governmentProjectFilter !== "") {
    additionalQueryParams.government_project = governmentProjectFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  // query.created_at = { $gte: getLastWeeksDate() };
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };

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
};

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
      team_lead_note,
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
        team_lead_note,
        updated_by: req.user._id,
      }
    );

    res.status(200).json({ message: "Questions updated sucessfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get other product api/v1/form_response/other_products
export const getOtherProducts = async (req, res) => {
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

  const additionalQueryParams = {};
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (stateFilter !== "") {
    additionalQueryParams.state = stateFilter;
  }
  if (lgaFilter !== "") {
    additionalQueryParams.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    additionalQueryParams.region = regionFilter;
  }
  if (nameFilter !== "") {
    additionalQueryParams.name = nameFilter;
  }
  if (brandFilter !== "") {
    additionalQueryParams.brand = brandFilter;
  }
  if (priceFilter !== "") {
    additionalQueryParams.price = priceFilter;
  }
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
    additionalQueryParams.approved = 0;
  }
  if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
    additionalQueryParams.approved = 1;
  }
  // query.created_at = { $gte: getLastWeeksDate() };
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
        },
      },
      additionalQueryParams,
    ],
  };

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
};

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
