import mongoose from "mongoose";
import Form from "../models/formModel.js";
import Product from "../models/productModel.js";
import OtherProduct from "../models/otherProductsModel.js";
import Accomodation from "../models/accomodationModel.js";
import Electricity from "../models/electricityModel.js";
import Transport from "../models/transportModel.js";
import Question from "../models/questionModel.js";
import "../utils/dateUtils.js";
import dotenv from "dotenv";
import { data } from "./excel.js";
import { lgaData } from "./lga.js";
import { clearDb } from "../controllers/formController.js";

dotenv.config({
  path: "configs/config.env",
});

import { connectDb } from "../configs/connectDb.js";

// connectDb("");
// clearDb()

// flatten the lgaData array of objects into a single array
const lgaLists = lgaData.flatMap((item) => item.lgas);

// function to calculate most similar lga
function calcCulateSimilarityScore(value, lga) {
  // split string values into an array of chars and remove spaces
  const valueChars = value.toLowerCase().replace(/\s/g, "").split("");
  const lgaChars = lga.toLowerCase().replace(/\s/g, "").split("");

  // initialize matchedChars count and make lgaCharSet unique
  let matchedChars = 0;
  const lgaCharSet = new Set(lgaChars);

  // Perform count update
  for (const valueChar of valueChars) {
    if (lgaCharSet.has(valueChar)) {
      matchedChars++;
      lgaCharSet.delete(valueChar);
    }
  }

  // return a ratio of matchedChars to valueChars or lgaChars with max length as score
  return matchedChars / Math.max(valueChars.length, lgaChars.length);
}

// function finds most similar lga from excel comparing to lgaData and returns the most similarin lgaData list
function findMostSimilarLga(value) {
  let mostSimilarLga = null;
  let highestSimilarityScore = 0;

  // compare similarityScore of lga string, return highest score
  for (const lga of lgaLists) {
    const similarityScore = calcCulateSimilarityScore(value, lga);
    if (similarityScore > highestSimilarityScore) {
      mostSimilarLga = lga;
      highestSimilarityScore = similarityScore;
    }
  }

  return mostSimilarLga;
}

const dataFormatter = (date) => {
  // Replacing the escaped forward slashes with regular slashes
  const cleanedDate = date.replace(/\\\//g, "/");
  
  //  split into required format
  const [day, month, year] = cleanedDate.split('/');
  const newDate = new Date(`${month}/${day}/${year}`);
  
  // Formatting the date as an ISO string
  const mongooseDate = newDate.toISOString();
  
  return mongooseDate;
};

const convertToJSOn = async () => {
  let formRes = {
    state: "",
    lga: "",
    foodItems: [],
    accomodations: [],
    transports: [],
    questions: [],
    others: [],
    electricity: [],
    created_at: "",
  };

  let count = 0;
  let succes = 0;
  let fail = 0;

  data.forEach((item) => {
    formRes.state = item["State"];
    formRes.lga = item["LGA"];

    // m/d/y
    formRes.created_at = dataFormatter(item["Week Ending"]);

    formRes.foodItems.push(
      {
        name: "Rice_1-cup",
        brand: item["Brand of 1 Cup of Rice"],
        price: item["Price of Rice -1 Cup"],
      },
      {
        name: "Rice_50-kg",
        brand: item["Brand of 50kg Rice"],
        price: item["Price of Rice - 50kg"],
      },
      {
        name: "Beans_1-cup",
        brand: item["Specify type of beans"],
        price: item["Price of Beans - 1 Cup"],
      },
      {
        name: "Beans_50-kg",
        brand: item["Specify type of 50kg beans"],
        price: item["Price of Beans - 50Kg"],
      },
      {
        name: "Garri_1-cup",
        brand: item["Type of Garri"],
        price: item["Price of Garri - 1 Cup"],
      },
      {
        name: "Garri_50-kg",
        brand: item["Type of 50kg Garri"],
        price: item["Price of Garri - 50kg"],
      },
      {
        name: "Fish",
        brand: item["Type of Fish, e.g. Titus"],
        price: item["Price of 1 Fish"],
      },
      {
        name: "Chicken_1-kg",
        brand: item[""],
        price: item["Price of 1 kg of chicken"],
      },
      {
        name: "Beef_5-pieces",
        brand: "",
        price: item["Price of 5 pieces of beef"],
      },
      {
        name: "Turkey_1-kg",
        brand: "",
        price: item["Price of 1 kg of turkey"],
      },
      {
        name: "Bread_1-loaf",
        brand: "",
        price: item["Price of 1 loaf of bread"],
      },
      {
        name: "Egg_1-crate",
        brand: "",
        price: item["Price of a crate of egg"],
      },
      {
        name: "Yam_1-Standard size",
        brand: "",
        price: item["Price of Yam (1 Standard size)"],
      },
      {
        name: "Palm oil_1-Litre",
        brand: "",
        price: item["Price of 1 Litre of Palm oil"],
      },
      {
        name: "Groundnut oil_1-Litre",
        brand: "",
        price: item["Price of 1 Litre of Groundnut oil"],
      },
      {
        name: "Tomatoes_4-seeds",
        brand: "",
        price: item["Price of Tomatoes (4 seeds)"],
      },
      {
        name: "Tomatoes_big-basket",
        brand: "",
        price: item["Price of Tomatoes (Big Basket)"],
      }
    );

    formRes.accomodations.push(
      {
        type: "self contain",
        rooms: "1",
        price:
          item["Price of Accommodation - Rent for 1 bed self contain per year"],
      },
      {
        type: "flat",
        rooms: "2",
        price:
          item["Price of Accommodation - Rent for 2 bedroom flat per year"],
      },
      {
        type: "flat",
        rooms: "3",
        price:
          item["Price of Accommodation - Rent for 3 bedroom flat per year"],
      },
      {
        type: "duplex",
        rooms: "1",
        price: item["Price of Accommodation - Rent for Duplex per year"],
      }
    );

    formRes.transports.push(
      {
        route: item["Specify Route (e.g. Oshodi to Yaba) Route 1"],
        mode: item["Mode of Transport for Route 1"],
        cost: item["Transport cost for Route 1"],
      },
      {
        route: item["Specify Route (e.g. Oshodi to Yaba) Route 2"],
        mode: item["Mode of Transport for Route 2"],
        cost: item["Transport cost for Route 2"],
      },
      {
        route: item["Specify Route (e.g. Oshodi to Yaba) Route 3"],
        mode: item["Mode of Transport for Route 3"],
        cost: item["Transport cost for Route 3"],
      }
    );

    formRes.electricity.push({
      hours_per_week:
        item[
          "Number of hours of electricity availability for within the last 1 week"
        ],
    });

    formRes.questions.push({
      government_project:
        item[
          "Any new government project in your LGA within the last 1 week?"
        ] === "No"
          ? false
          : true,
      comment_for_government_project: item[
        "If yes, provide link if available and details"
      ]
        ? item["If yes, provide link if available and details"]
        : null,
      crime_report:
        item["Any crime reported in your LGA within the last 1 week?"] === "No"
          ? false
          : true,

      accidents:
        item["Any accidents in your LGA within the last 1 week?"] === "No"
          ? false
          : true,
    });

    formRes.others.push(
      {
        name: "Kerosene_1-Litre",
        brand: "",
        price: item["Price of Kerosene (1 Litre)"],
      },
      {
        name: "Cooking Gas_12-kg",
        brand: "",
        price: item["Price of Cooking Gas (12kg)"],
      },
      {
        name: "Firewood_1-bundle",
        brand: "",
        price: item["Price of Firewood (1 bundle)"],
      },
      {
        name: "Charcoal",
        brand: item["Charcoal (1 bag) - Choose amount"],
        price: item["Price of Chosen Kg of Charcoal (1 bag)"],
      },
      {
        name: "Diesel_1-Litre",
        brand: item["Charcoal (1 bag) - Choose amount"],
        price: item["Price of Diesel (1 Liter)"],
      },
      {
        name: "Petrol/PMS_1-Litre",
        brand: "",
        price: item["Price of Petrol\/PMS (1 Liter)"],
      },
      {
        name: "Cement_50-kg",
        brand: item["Cement - Choose brand"],
        price: item["Price of Cement (50 Kg bag for chosen brand)"],
      },
      {
        name: "Building Block",
        brand: item["Size of building block"],
        price: item["Price of Building block"],
      }
    );

    const addFormData = async (formRes) => {
      //   const session = await mongoose.startSession();
      //   session.startTransaction();

      console.log(formRes);
      try {
        const {
          foodItems,
          accomodations,
          transports,
          electricity,
          questions,
          others,
          lga,
          state,
          created_at,
        } = formRes;

        // validate here

        // food items
        let food_ids = await Promise.all(
          foodItems.map(async (item, index) => {
            const { name, price, brand } = item;

            let newProduct = await new Product(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                name,
                price,
                brand,
                created_at,
              }
              //   { session: session }
            ).save();

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

            let newQuestion = await new Question(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                government_project,
                comment_for_government_project,
                crime_report,
                comment_for_crime_report,
                accidents,
                comment_for_accidents,
                note,
                created_at,
              }
              //   { session: session }
            ).save();
            return newQuestion._id;
          })
        );

        //  accomodations
        let accomodation_ids = await Promise.all(
          accomodations.map(async (item, index) => {
            const { type, price, rooms } = item;

            let newAccomodation = await new Accomodation(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                type,
                rooms,
                price,
                created_at,
              }

              //   { session: session }
            ).save();
            return newAccomodation._id;
          })
        );
        //   electricty
        let electricity_ids = await Promise.all(
          electricity.map(async (item, index) => {
            const { hours_per_week } = item;

            let newElectricty = await new Electricity(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                hours_per_week,
                created_at,
              }

              //   { session: session }
            ).save();
            return newElectricty._id;
          })
        );

        //   transports
        let transport_ids = await Promise.all(
          transports.map(async (item, index) => {
            const { route, mode, cost } = item;

            let newTransport = await new Transport(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                route,
                mode,
                cost,
                created_at,
              }

              //   { session: session }
            ).save();
            return newTransport._id;
          })
        );

        // other products
        let other_product_ids = await Promise.all(
          others.map(async (item, index) => {
            const { name, price, brand } = item;

            let newOtherProduct = await new OtherProduct(
              {
                created_by: `648f78e424b0cb0c6d5fb0ef`,
                state: state,
                team_lead_id: `648f7332d1e46a487e874a0f`,
                lga: lga,
                name,
                price,
                brand,
                created_at,
              }

              //   { session: session }
            ).save();

            return newOtherProduct._id;
          })
        );

        // parent entry
        const newEntry = await new Form(
          {
            created_by: `648f78e424b0cb0c6d5fb0ef`,
            state: state,
            team_lead_id: `648f7332d1e46a487e874a0f`,
            lga: lga,
            foodItems: food_ids,
            accomodations: accomodation_ids,
            transports: transport_ids,
            electricity: electricity_ids,
            others: other_product_ids,
            questions: questions_ids,
            //   clothings: clothing_ids,
            created_at,
          }

          //   { session: session }
        ).save();
        // Commit the changes
        // await session.commitTransaction();

        console.log("Success after putting everything.....", count);
        succes++;
        count++;
      } catch (error) {
        // Rollback any changes made in the database
        // session.abortTransaction();
        // res.status(500).json({ message: error.message });
        // return next(new ErrorHandler(error.message, 500));
        console.log("Error ", error, count);
        fail++;
        count++;
      }
    };

    addFormData(formRes);
    console.log(succes, "success");
    console.log(fail, "fail");
    console.log(count, "count");

    formRes.foodItems = [];
    formRes.electricity = [];
    formRes.questions = [];
    formRes.others = [];
    formRes.accomodations = [];
    formRes.transports = [];
  });
};

convertToJSOn();
