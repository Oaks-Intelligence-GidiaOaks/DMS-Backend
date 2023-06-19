import mongoose from "mongoose";
import Form from "../models/formModel.js";
import "../utils/dateUtils.js";

const currentWeek = new Date().getWeek();
const today = new Date();
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

export const getMasterListData = async (req, res) => {
  try {
    const { startDateFilter, endDateFilter, page } = req.query;
    const query = {};
    const startDate = startDateFilter ? startDateFilter : oneMonthAgo;
    const endDate = endDateFilter ? endDateFilter : today;
    if (req?.user?.role === "team_lead") {
      query.lga = {
        $in: req.user.LGA,
      };
    }
    if (req?.user?.role === "admin" || req?.user?.role === "super_admin") {
      query.approved = 1;
    }
    const currentPage = page || 1;
    const skip = (currentPage - 1) * 60;
    query.created_at = { $gte: startDate, $lte: endDate };
    // const query = {
    //   $and: [
    //     {
    //       $expr: {
    //         $eq: [
    //           { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
    //           weekFilter ? parseInt(weekFilter) : currentWeek,
    //         ],
    //       },
    //     },
    //     additionalQueryParams,
    //   ],
    // };

    // Query the database for the desired forms
    const total = await Form.countDocuments(query);
    const forms = await Form.find(query)
      .sort({ created_at: -1 }) // Sort by created_at in descending order
      .populate("foodItems", "name brand price") // Populate foodItems and select the name, brand, and price fields
      .populate("accomodations", "type rooms price") // Populate accomodations and select the name, propertyType, and price fields
      .populate("transports", "route mode cost") // Populate transports and select the name, mode, and cost fields
      .populate("electricity", "hours_per_week") // Populate electricity and select the name, type, and voltage fields
      .populate("others", "name brand price") // Populate electricity and select the name, type, and voltage fields
      .populate("clothings", "category sub_category size price") // Populate electricity and select the name, type, and voltage fields
      .populate(
        "questions",
        "government_project comment_for_government_project crime_report comment_for_crime_report accidents comment_for_accidents note"
      )
      .populate("created_by") // Populate created_by and select the name and _id fields
      .skip(skip)
      .limit(60);
    // .exec((err, forms) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });
    res.status(200).json({ forms, total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
