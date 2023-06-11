import Product from "../models/productModel.js";
import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import User from "../models/userModel.js";
import "../utils/dateUtils.js";
import { lgaData } from "../data/lga.js";

// Helper function to get the week number of a given date
const getWeekNumber = (date) => {
  const onejan = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date - onejan) / 86400000 + onejan.getDay() + 1) / 7);
};

// Helper function to get the year of a given date
const getYear = (date) => {
  return date.getFullYear();
};

// Helper function to calculate the percentage change between two values
const calculatePercentageChange = (previousValue, currentValue) => {
  if (previousValue === 0) {
    if (currentValue === 0) {
      return 0; // No change
    } else {
      return Infinity; // Percentage increase is infinite
    }
  }

  return ((currentValue - previousValue) / previousValue) * 100;
};
const getWeekStartDate = (year, weekNo) => {
  const date = new Date(year, 0, 1);
  const day = date.getDay() || 7;
  const diff = 7 * (weekNo - 1) - day + 1;
  date.setDate(date.getDate() + diff);
  return date;
};

const getWeekEndDate = (year, weekNo) => {
  const startDate = getWeekStartDate(year, weekNo);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return endDate;
};

const getCurrentWeekPrice = (product) => {
  const currentWeek = getWeekNumber(new Date());
  const currentPrice = product.weeklyPrices.find(
    (price) => price.weekNo === currentWeek
  );

  return currentPrice ? currentPrice.price : 0;
};

const currentDate = new Date();
const currentWeek = getWeekNumber(currentDate);
const previousWeekNos = [
  currentWeek - 4,
  currentWeek - 3,
  currentWeek - 2,
  currentWeek - 1,
  currentWeek,
];
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth() + 1;

// Get the start and end timestamps of the current month
const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

export const getAdminPriceFluctuation = async (req, res) => {
  try {
    const { lgaFilter } = req.query;

    const productsWithResult = await Product.find({
      lga: lgaFilter,
    }).exec();

    const populatedProducts = await Promise.all(
      productsWithResult.map(async (product) => {
        const { name } = product;

        const weeklyPrice = [];
        let totalPrice = 0;

        for (const weekNo of previousWeekNos) {
          const weekStart = getWeekStartDate(currentDate.getFullYear(), weekNo);
          const weekEnd = getWeekEndDate(currentDate.getFullYear(), weekNo);

          const weekPrice = await Product.findOne({
            $and: [
              {
                $expr: {
                  $eq: [
                    {
                      $week: { date: "$created_at", timezone: "Africa/Lagos" },
                    },
                    weekNo,
                  ],
                },
              },
              { lga: lgaFilter },
              { name: name },
            ],
          })
            .select("price")
            .lean()
            .exec();

          const price = weekPrice ? weekPrice.price : 0;
          weeklyPrice.push({ x: weekNo, y: price });
          totalPrice += price;
        }

        const priceChange = calculatePercentageChange(
          weeklyPrice[3].y,
          weeklyPrice[4].y
        );

        return {
          name,
          weeklyPrice,
          priceChange,
        };
      })
    );

    res.status(200).json(populatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getTeamLeadCount = async (req, res) => {
  try {
    const totalTeamLead = await User.countDocuments({
      role: "team_lead",
      disabled: false,
    });
    const newlyAdded = await User.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      role: "team_lead",
    });
    res.status(200).json({ totalTeamLead, newlyAdded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getEnumeratorsCount = async (req, res) => {
  try {
    const totalEnumerators = await Enumerator.countDocuments({
      disabled: false,
    });
    const newlyAdded = await Enumerator.countDocuments({
      created_at: { $gte: startOfMonth, $lt: endOfMonth },
    });
    res.status(200).json({ totalEnumerators, newlyAdded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getLGACount = async (req, res) => {
  try {
    const lgas = lgaData;
    const teamLead = await User.find({ role: "team_lead", disabled: false });
    // Count the LGAs for each state
    const stateCounts = [];
    for (const lga of lgas) {
      stateCounts.push({
        state: lga.state,
        lgaCount: lga.lgas.length,
      });
    }
    let assignedLga = 0;
    teamLead.forEach((item) => {
      assignedLga += item.LGA.length;
    });

    res.status(200).json({ totalLga: 774, assignedLga });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmissionCount = async (req, res) => {
  try {
    const teamLead = await User.find({ role: "team_lead", disabled: false });
    let assignedLga = 0;
    teamLead.forEach((item) => {
      assignedLga += item.LGA.length;
    });
    // Get the number of submissions for each month of the current year
    Form.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(
              req.query.yearFilter ? req.query.yearFilter : currentYear,
              0,
              1
            ), // Start of the current year
            $lt: new Date(
              req.query.yearFilter ? req.query.yearFilter : currentYear + 1,
              0,
              1
            ), // Start of the next year
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$created_at" }, // Extract the month from the created_at field
            year: { $year: "$created_at" }, // Extract the year from the created_at field
          },
          count: { $sum: 1 }, // Count the number of documents in each group
        },
      },
    ]).exec((err, results) => {
      if (err) {
        console.error(err);
        return;
      }
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const submissionsByMonth = {};

      // Initialize the submissions and notSubmitted objects for each month
      months.forEach((month) => {
        submissionsByMonth[month] = {
          month,
          submitted: 0,
          notSubmitted: assignedLga,
        };
      });

      // Calculate the number of submissions for each month
      results.forEach((result) => {
        const month = months[result._id.month - 1];
        submissionsByMonth[month].submitted += result.count;
        submissionsByMonth[month].notSubmitted =
          assignedLga - submissionsByMonth[month].submitted;
      });

      // Convert the objects to arrays of the desired format
      const submissionsArray = Object.values(submissionsByMonth);

      res.status(200).json({ submissionsArray });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
