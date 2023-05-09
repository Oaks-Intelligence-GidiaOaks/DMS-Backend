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

// add form response data api/v1/form/add_data
export const addFormData = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      foodItems,
      accomodations,
      transports,
      electricity,
      questions,
      others,
    } = req.body;
    // validate here
    console.log(req.enumerator);

    const session = await mongoose.startSession();
    session.startTransaction();

    // food items
    let food_ids = await Promise.all(
      foodItems.map(async (item, index) => {
        const { name, price, brand } = item;

        let newProduct = await new Product({
          created_by: req.enumerator._id,
          name,
          price,
          brand,
        }).save();

        return newProduct._id;
      })
    );

    // questions
    let questions_ids = await Promise.all(
      questions.map(async (item, index) => {
        const { question, response, comment } = item;

        let newQuestion = await new Question({
          created_by: req.enumerator._id,
          question,
          response,
          comment,
        }).save();
        return newQuestion._id;
      })
    );

    //   accomodations
    let accomodation_ids = await Promise.all(
      accomodations.map(async (item, index) => {
        const { type, price } = item;

        let newAccomodation = await new Accomodation({
          created_by: req.enumerator._id,
          type,
          // rooms,
          price,
        }).save();
        return newAccomodation._id;
      })
    );
    //   electricty
    let electricity_ids = await Promise.all(
      electricity.map(async (item, index) => {
        const { hours_per_week } = item;

        let newElectricty = await new Electricity({
          created_by: req.enumerator._id,
          hours_per_week,
        }).save();
        return newElectricty._id;
      })
    );

    //   transports
    let transport_ids = await Promise.all(
      transports.map(async (item, index) => {
        const { start, end, mode, cost } = item;

        let newTransport = await new Transport({
          created_by: req.enumerator._id,
          start,
          end,
          mode,
          cost,
        }).save();
        return newTransport._id;
      })
    );

    // other products
    let other_product_ids = await Promise.all(
      others.map(async (item, index) => {
        const { name, price, brand } = item;

        let newOtherProduct = await new OtherProduct({
          created_by: req.enumerator._id,
          name,
          price,
          brand,
        }).save();

        return newOtherProduct._id;
      })
    );

    // parent entry
    const newEntry = await new Form({
      created_by: req.enumerator._id,
      foodItems: food_ids,
      accomodations: accomodation_ids,
      transports: transport_ids,
      electricity: electricity_ids,
      others: other_product_ids,
      questions: questions_ids,
      // created_at: new Date().toISOString(),
    }).save();

    // Commit the changes
    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "form submit successfull...", entry: newEntry });
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
    // return next(new ErrorHandler(error.message, 500));
  } finally {
    // Ending the session
    session.endSession();
  }
});

// get all form data api/v1/form/form_data
export const getFormData = catchAsyncErrors(async (req, res, next) => {
  try {
    const data = await Form.find()
      .populate("created_by")
      .populate("foodItems")
      .populate("accomodations")
      .populate("transports")
      .populate("questions");

    const filteredList = data.filter((item) => {
      item.user == req.user._id;
    });

    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});
