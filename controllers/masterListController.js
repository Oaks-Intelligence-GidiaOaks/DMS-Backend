import mongoose from "mongoose";
import Form from "../models/formModel.js";
import "../utils/dateUtils.js";

const currentWeek = new Date().getWeek();

export const getMasterListData = async (req, res) => {
  try {
    const { weekFilter = "" } = req.query;
    const additionalQueryParams = {};

    if (req?.user?.role === "team_lead") {
      additionalQueryParams.team_lead_id = req.user._id;
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
              weekFilter ? weekFilter : currentWeek,
            ],
          },
        },
        additionalQueryParams,
      ],
    };
    // Query the database for the desired forms
    Form.find(query)
      .sort({ created_at: -1 }) // Sort by created_at in descending order
      .populate("foodItems", "name brand price") // Populate foodItems and select the name, brand, and price fields
      .populate("accomodations", "type rooms price") // Populate accomodations and select the name, propertyType, and price fields
      .populate("transports", "route mode cost") // Populate transports and select the name, mode, and cost fields
      .populate("electricity", "hours_per_week") // Populate electricity and select the name, type, and voltage fields
      .populate("others", "name brand price") // Populate electricity and select the name, type, and voltage fields
      .populate(
        "questions",
        "government_project comment_for_government_project crime_report comment_for_crime_report accidents comment_for_accidents note"
      )
      .populate("created_by") // Populate created_by and select the name and _id fields
      .exec((err, forms) => {
        if (err) {
          console.error(err);
          return;
        }
        res.status(200).json(forms);
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
