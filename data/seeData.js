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

dotenv.config({
  path: "configs/config.env",
});

import { connectDb } from "../configs/connectDb.js";

connectDb(
  "mongodb+srv://info:KodersOaks2023@dms.lt6sqba.mongodb.net/?retryWrites=true&w=majority"
);

const oneRow = [
  {
    "Week Ending": "11/26/2022",
    Timestamp: "11/24/22",
    Name: "Esther Ukhurebor",
    State: "Abia",
    LGA: "Arochukwu",
    "Price of Rice -1 Cup": "200",
    "Brand of 1 Cup of Rice": "Foreign",
    "Price of Rice - 50kg": "48000",
    "Brand of 50kg Rice": "Foreign",
    "Price of Beans - 1 Cup": "170",
    "Specify type of beans": "White beans",
    "Price of Beans - 50Kg": "68000",
    "Specify type of 50kg beans": "White beans",
    "Price of Garri - 1 Cup": "150",
    "Type of Garri": "Yellow Garri",
    "Price of Garri - 50kg": "8500",
    "Type of 50kg Garri": "Yellow Garri",
    "Price of Tomatoes (4 seeds)": "200",
    "Price of Tomatoes (Big Basket)": "38000",
    "Price of Kerosene (1 Litre)": "900",
    "Price of Cooking Gas (12kg)": "9000",
    "Price of 1 Fish": "800",
    "Type of Fish, e.g. Titus": "Titus",
    "Price of 5 pieces of beef": "500",
    "Price of 1 kg of chicken": "3000",
    "Price of 1 kg of turkey": "3500",
    "Price of 1 loaf of bread": "800",
    "Price of a crate of egg": "1900",
    "Price of Yam (1 Standard size)": "1000",
    "Price of 1 Litre of Palm oil": "900",
    "Price of 1 Litre of Groundnut oil": "1000",
    "Price of Firewood (1 bundle)": "200",
    "Charcoal (1 bag) - Choose amount": "50 Kg",
    "Price of Chosen Kg of Charcoal (1 bag)": "4000",
    "Price of Diesel (1 Liter)": "900",
    "Price of Petrol/PMS  (1 Liter)": "250",
    "Cement - Choose brand": "Dangote",
    "Price of Cement (50 Kg bag for chosen brand)": "4500",
    "Size of building block": "6-inch",
    "Price of Building block": "150",
    "Price of Accommodation - Rent for 1 bed self contain per year": "150000",
    "Price of Accommodation - Rent for 2 bedroom flat per year": "250000",
    "Price of Accommodation - Rent for 3 bedroom flat per year": "350000",
    "Price of Accommodation - Rent for Duplex per year": "450000",
    "Specify Route (e.g. Oshodi to Yaba)  Route 1": "Amuvi to Asaga",
    "Mode of Transport for Route 1": "Bike",
    "Transport cost for Route 1": "100",
    "Specify Route (e.g. Oshodi to Yaba)  Route 2": "Amuvi to Obinkita",
    "Mode of Transport for Route 2": "Bike",
    "Transport cost for Route 2": "200",
    "Specify Route (e.g. Oshodi to Yaba)  Route 3": "Amuvi to Amanagwu",
    "Mode of Transport for Route 3": "Bike",
    "Transport cost for Route 3": "250",
    "Any new government project in your LGA within the last 1 week?": "No",
    "Any crime reported in your LGA within the last 1 week?": "No",
    "Any accidents in your LGA within the last 1 week?": "No",
    "Number of hours of electricity availability for within the last 1 week":
      "76",
  },
  {
    "Week Ending": "11/26/2022",
    Timestamp: "11/24/22",
    Name: "Esther Ukhurebor",
    State: "Abia",
    LGA: "Arochukwu",
    "Price of Rice -1 Cup": "4000",
    "Brand of 1 Cup of Rice": "Foreign",
    "Price of Rice - 50kg": "67000",
    "Brand of 50kg Rice": "Foreign",
    "Price of Beans - 1 Cup": "170",
    "Specify type of beans": "White beans",
    "Price of Beans - 50Kg": "68000",
    "Specify type of 50kg beans": "White beans",
    "Price of Garri - 1 Cup": "150",
    "Type of Garri": "Yellow Garri",
    "Price of Garri - 50kg": "8500",
    "Type of 50kg Garri": "Yellow Garri",
    "Price of Tomatoes (4 seeds)": "200",
    "Price of Tomatoes (Big Basket)": "38000",
    "Price of Kerosene (1 Litre)": "900",
    "Price of Cooking Gas (12kg)": "9000",
    "Price of 1 Fish": "800",
    "Type of Fish, e.g. Titus": "Titus",
    "Price of 5 pieces of beef": "500",
    "Price of 1 kg of chicken": "3000",
    "Price of 1 kg of turkey": "3500",
    "Price of 1 loaf of bread": "800",
    "Price of a crate of egg": "1900",
    "Price of Yam (1 Standard size)": "1000",
    "Price of 1 Litre of Palm oil": "900",
    "Price of 1 Litre of Groundnut oil": "1000",
    "Price of Firewood (1 bundle)": "200",
    "Charcoal (1 bag) - Choose amount": "50 Kg",
    "Price of Chosen Kg of Charcoal (1 bag)": "4000",
    "Price of Diesel (1 Liter)": "900",
    "Price of Petrol/PMS  (1 Liter)": "250",
    "Cement - Choose brand": "Dangote",
    "Price of Cement (50 Kg bag for chosen brand)": "4500",
    "Size of building block": "6-inch",
    "Price of Building block": "150",
    "Price of Accommodation - Rent for 1 bed self contain per year": "150000",
    "Price of Accommodation - Rent for 2 bedroom flat per year": "250000",
    "Price of Accommodation - Rent for 3 bedroom flat per year": "350000",
    "Price of Accommodation - Rent for Duplex per year": "450000",
    "Specify Route (e.g. Oshodi to Yaba)  Route 1": "Amuvi to Asaga",
    "Mode of Transport for Route 1": "Bike",
    "Transport cost for Route 1": "100",
    "Specify Route (e.g. Oshodi to Yaba)  Route 2": "Amuvi to Obinkita",
    "Mode of Transport for Route 2": "Bike",
    "Transport cost for Route 2": "200",
    "Specify Route (e.g. Oshodi to Yaba)  Route 3": "Amuvi to Amanagwu",
    "Mode of Transport for Route 3": "Bike",
    "Transport cost for Route 3": "250",
    "Any new government project in your LGA within the last 1 week?": "No",
    "Any crime reported in your LGA within the last 1 week?": "No",
    "Any accidents in your LGA within the last 1 week?": "No",
    "Number of hours of electricity availability for within the last 1 week":
      "76",
  },
];

const dataFormatter = (date) => {
  const newDate = new Date(date);
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
    team_lead_id: "647e3f79ccaa6bef13f72f5b",
    created_by: "647f5b82ec8f57bbf6d96a4b",
  };

  oneRow.forEach((item) => {
    formRes.state = item["State"];
    formRes.lga = item["LGA"];

    formRes.created_at = dataFormatter("2023/12/07");

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
        route: item["Specify Route (e.g. Oshodi to Yaba)  Route 1"],
        mode: item["Mode of Transport for Route 1"],
        cost: item["Transport cost for Route 1"],
      },
      {
        route: item["Specify Route (e.g. Oshodi to Yaba)  Route 2"],
        mode: item["Mode of Transport for Route 2"],
        cost: item["Transport cost for Route 2"],
      },
      {
        route: item["Specify Route (e.g. Oshodi to Yaba)  Route 3"],
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
      }
    );

    const addFormData = async (formRes) => {
      console.log(formRes);

      try {
        const session = await mongoose.startSession();
        session.startTransaction();

        const createdForm = await Form.create([formRes], { session });
        const formIds = createdForm.map((form) => form._id);

        console.log(createdForm, "form");

        await Product.create(
          [
            {
              formId: formIds[0],
              name: "Rice_1cup",
              brand: "Maama Gold",
              price: "200",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              name: "Rice_50kg",
              brand: "Maama Gold",
              price: "200",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await OtherProduct.create(
          [
            {
              formId: formIds[0],
              name: "Other Product 1",
              brand: "Other Product",
              price: "300",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              name: "Other Product 2",
              brand: "Other Product",
              price: "300",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await Accomodation.create(
          [
            {
              formId: formIds[0],
              type: "Accommodation 1",
              rooms: "1",
              price: "300",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              type: "Accommodation 2",
              created_at: formRes.created_at,
              rooms: "2",
              price: "300",
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await Electricity.create(
          [
            {
              formId: formIds[0],
              hours_per_week: 10,
              created_at: formRes.created_at,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              hours_per_week: 8,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await Transport.create(
          [
            {
              formId: formIds[0],
              mode: "Transport 1",
              route: "formRes.route",
              cost: "300",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              mode: "Transport 2",
              route: "formRes.route",
              cost: "300",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await Question.create(
          [
            {
              formId: formIds[0],
              question: "Question 1",
              government_project: formRes.government_project,
              comment_for_government_project:
                formRes.comment_for_government_project,
              crime_report: formRes.crime_report,
              comment_for_crime_report: formRes.comment_for_crime_report,
              accidents: formRes.accidents,
              comment_for_accidents: formRes.comment_for_accidents,
              note: formRes.note,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              state: formRes.state,
              lga: formRes.lga,
            },
            {
              formId: formIds[1],
              question: "Question 2",
              government_project: formRes.government_project,
              comment_for_government_project:
                formRes.comment_for_government_project,
              crime_report: formRes.crime_report,
              comment_for_crime_report: formRes.comment_for_crime_report,
              accidents: formRes.accidents,
              comment_for_accidents: formRes.comment_for_accidents,
              note: formRes.note,
              created_at: formRes.created_at,
              created_by: `647f5b82ec8f57bbf6d96a4b`,
              team_lead_id: "647e3f79ccaa6bef13f72f5b",
              state: formRes.state,
              lga: formRes.lga,
            },
          ],
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        console.log("Data conversion and storage completed successfully!");
      } catch (error) {
        console.error("Error converting and storing data:", error);
      }
    };

    addFormData(formRes);

    formRes.foodItems = [];
    formRes.electricity = [];
    formRes.questions = [];
    formRes.others = [];
    formRes.accomodations = [];
    formRes.transports = [];
  });
};

convertToJSOn();
