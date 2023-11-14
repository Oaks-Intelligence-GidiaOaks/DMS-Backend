import mongoose from "mongoose";
import Form from "../models/formModel.js";
import Product from "../models/productModel.js";
import OtherProduct from "../models/otherProductsModel.js";
import Accomodation from "../models/accomodationModel.js";
import Electricity from "../models/electricityModel.js";
import Transport from "../models/transportModel.js";
import Question from "../models/questionModel.js";
import Clothing from "../models/clothingModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import "../utils/dateUtils.js";
import { createAuditLog } from "./auditLogController.js";

// Helper function to get the week number of a given date
const getWeekNumber = (date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
};

const currentWeek = getWeekNumber(new Date());

// add form response data api/v1/form/add_data
// export const addFormData = catchAsyncErrors(async (req, res, next) => {
export const addFormData = async (req, res) => {
  const ipAddress = req.socket.remoteAddress;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      foodItems,
      accomodations,
      transports,
      electricity,
      questions,
      others,
      lga,
      clothings,
    } = req.body;
    // validate here

    const query = {
      $and: [
        {
          $expr: {
            $and: [
              {
                $eq: [
                  { $year: { date: "$created_at", timezone: "Africa/Lagos" } },
                  new Date().getFullYear(),
                ],
              },
              {
                $eq: [
                  { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
                  currentWeek,
                ],
              },
              {
                lga: lga ? lga : req.enuumerator.LGA[0],
              },
            ],
          },
        },
        // additionalQueryParams,
      ],
    };

    const alreadySubmited = await Form.find(query);
    if (alreadySubmited.length > 0) {
      res.status(403).json({ message: "Already submitted for this week" });
    } else {
      // food items
      let food_ids = await Promise.all(
        foodItems.map(async (item, index) => {
          const { name, price, brand, size } = item;

          let newProduct = await new Product({
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            name,
            price,
            brand,
            size,
          }).save();

          return newProduct._id;
        })
      );

      // questions
      let questions_ids = await Promise.all(
        questions.map(async (item, index) => {
          const {
            government_project,
            comment_for_government_project,
            crime_report,
            comment_for_crime_report,
            accidents,
            comment_for_accidents,
            note,
          } = item;

          let newQuestion = await new Question({
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            government_project,
            comment_for_government_project,
            crime_report,
            comment_for_crime_report,
            accidents,
            comment_for_accidents,
            note,
          }).save();
          return newQuestion._id;
        })
      );

      //  accomodations
      let accomodation_ids = await Promise.all(
        accomodations.map(async (item, index) => {
          const { type, price, rooms } = item;

          let newAccomodation = await new Accomodation({
            created_by: req.enumerator._id,
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            type,
            rooms,
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
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            hours_per_week,
          }).save();
          return newElectricty._id;
        })
      );

      //   transports
      let transport_ids = await Promise.all(
        transports.map(async (item, index) => {
          const { route, mode, cost } = item;

          let newTransport = await new Transport({
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            route,
            mode,
            cost,
          }).save();
          return newTransport._id;
        })
      );

      // other products
      let other_product_ids = await Promise.all(
        others.map(async (item, index) => {
          const { name, price, brand, size } = item;

          let newOtherProduct = await new OtherProduct({
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            name,
            price,
            brand,
            size,
          }).save();

          return newOtherProduct._id;
        })
      );

      // clothing
      let clothing_ids = await Promise.all(
        clothings.map(async (item, index) => {
          const { category, sub_category, size, price } = item;

          let newClothing = await new Clothing({
            created_by: req.enumerator._id,
            region: req.enumerator?.region,
            state: req.enumerator.state,
            team_lead_id: req.enumerator.user,
            lga: lga ? lga : req.enumerator.LGA[0],
            category,
            sub_category,
            size,
            price,
          }).save();

          return newClothing._id;
        })
      );

      console.log({
        created_by: req.enumerator._id,
        region: req.enumerator?.region,
        state: req.enumerator.state,
        team_lead_id: req.enumerator.user,
        lga: lga ? lga : req.enumerator.LGA[0],
        foodItems: food_ids,
        accomodations: accomodation_ids,
        transports: transport_ids,
        electricity: electricity_ids,
        others: other_product_ids,
        questions: questions_ids,
        clothings: clothing_ids,
        // created_at: new Date().toISOString(),
      });

      // parent entry
      const newEntry = await new Form({
        created_by: req.enumerator._id,
        region: req.enumerator?.region,
        state: req.enumerator.state,
        team_lead_id: req.enumerator.user,
        lga: lga ? lga : req.enumerator.LGA[0],
        foodItems: food_ids,
        accomodations: accomodation_ids,
        transports: transport_ids,
        electricity: electricity_ids,
        others: other_product_ids,
        questions: questions_ids,
        clothings: clothing_ids,
        // created_at: new Date().toISOString(),
      }).save();

      const logData = {
        title: "Submission",
        description: `Enumerator made submissions for ${
          lga ? lga : req.enumerator.LGA[0]
        }`,
        name: req.enumerator.firstName,
        id: req.enumerator.id,
        ip_address: ipAddress,
      };

      await createAuditLog(logData);

      // Commit the changes
      await session.commitTransaction();
      res
        .status(200)
        .json({ message: "form submit successfull...", entry: newEntry });
    }
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
    // return next(new ErrorHandler(error.message, 500));
  } finally {
    // Ending the session
    session.endSession();
  }
};

// get all form data api/v1/form/form_data
export const getFormData = catchAsyncErrors(async (req, res, next) => {
  try {
    // console.log("see me");
    const data = await Form.find();
    res.status(200).json({ data });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

export const clearDb = async (req, res) => {
  try {
    await Form.deleteMany({});
    await Product.deleteMany({});
    await Accomodation.deleteMany({});
    await OtherProduct.deleteMany({});
    await Electricity.deleteMany({});
    await Transport.deleteMany({});
    await Question.deleteMany({});
    res.status(200).json({ message: "form data cleared cleared" });
  } catch (error) {
    res.status(500).json({ message: error.mesaage });
  }
};
