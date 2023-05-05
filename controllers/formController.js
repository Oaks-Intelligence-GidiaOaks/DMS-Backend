import mongoose from "mongoose";
import formModel from "../models/formModel.js";
import productModel from "../models/productModel.js";
import accomodationModel from "../models/accomodationModel.js";
import transportModel from "../models/transportModel.js";
import questionModel from "../models/questionModel.js";

export const addFormData = async (req, res) => {
  try {
    const { foodItems, accomodations, transports, questions } = req.body;
    // validate here

    const session = await mongoose.startSession();
    session.startTransaction();
    // food items
    let food_ids = await Promise.all(
      foodItems.map(async (item, index) => {
        const { name, price, brand } = item;

        let newProduct = await new productModel({
          name,
          price,
          brand,
        }).save();

        return newProduct._id;
      })
    );

    //   accomodations
    let accomodation_ids = await Promise.all(
      accomodations.map(async (item, index) => {
        const { type, rooms, price } = item;

        let newAccomodation = await new accomodationModel({
          type,
          rooms,
          price,
        }).save();
        return newAccomodation._id;
      })
    );

    //   transports
    let transport_ids = await Promise.all(
      transports.map(async (item, index) => {
        const { from, to, mode, cost } = item;

        let newTransport = await new transportModel({
          from,
          to,
          mode,
          cost,
        }).save();
        return newTransport._id;
      })
    );

    // questions
    let questions_ids = await Promise.all(
      questions.map(async (item, index) => {
        const { question, response, comment } = item;

        let newQuestion = await new questionModel({
          question,
          response,
          comment,
        }).save();
        return newQuestion._id;
      })
    );

    // parent entry
    const newEntry = await new formModel({
      // created_by: req.user._id,
      foodItems: food_ids,
      accomodations: accomodation_ids,
      transports: transport_ids,
      questions: questions_ids,
      // created_at: new Date().toISOString(),
    }).save();

    session.commitTransaction();
    res
      .status(200)
      .json({ message: "form submit successfull...", entry: newEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFormData = async (req, res) => {
  try {
    const data = await formModel
      .find()
      .populate("foodItems")
      .populate("accomodations")
      .populate("transports")
      .populate("questions");

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
