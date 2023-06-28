import Product from "../models/productModel.js";
import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";
import "../utils/dateUtils.js";
import fs from "fs";
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

export const getPriceFluctuation = async (req, res) => {
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

    //   const query = {};
    //   if (req?.user?.role === "team_lead") {
    //     query.team_lead_id = req.user._id;
    //   }

    //   // Get the current year
    //   const currentYear = new Date().getFullYear();
    //   // Generate an array of week numbers from 1 to 4
    //   const weeks = [1, 2, 3, 4];
    //   // Array to hold the month names
    //   const monthNames = [
    //     "January",
    //     "February",
    //     "March",
    //     "April",
    //     "May",
    //     "June",
    //     "July",
    //     "August",
    //     "September",
    //     "October",
    //     "November",
    //     "December",
    //   ];
    //   try {
    //     // Get the percentage increase or decrease in prices per month
    //     Product.aggregate([
    //       {
    //         $match: {
    //           lga: lgaFilter, // Replace 'your_created_by' with the desired value for the created_by field
    //           created_at: {
    //             $gte: new Date(currentYear, 0, 1), // Start of the current year
    //             $lte: new Date(currentYear, 11, 31), // End of the current year
    //           },
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: {
    //             month: { $month: "$created_at" }, // Extract the month from the created_at field
    //             product: "$name", // Group by the product_name field
    //           },
    //           weeklyPrices: {
    //             $push: {
    //               week: { $week: "$created_at" }, // Extract the week from the created_at field
    //               price: "$price",
    //             },
    //           },
    //         },
    //       },
    //       {
    //         $group: {
    //           _id: "$_id.product",
    //           monthlyPrices: {
    //             $push: {
    //               month: {
    //                 $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }],
    //               }, // Get the month name from the monthNames array
    //               weeklyPrices: "$weeklyPrices",
    //             },
    //           },
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: 0,
    //           product: "$_id",
    //           monthlyPrices: {
    //             $map: {
    //               input: "$monthlyPrices",
    //               as: "monthData",
    //               in: {
    //                 month: "$$monthData.month",
    //                 weeklyPrices: "$$monthData.weeklyPrices",
    //                 priceChange: {
    //                   $cond: {
    //                     if: { $gt: [{ $size: "$$monthData.weeklyPrices" }, 1] },
    //                     then: {
    //                       $multiply: [
    //                         {
    //                           $divide: [
    //                             {
    //                               $subtract: [
    //                                 {
    //                                   $arrayElemAt: [
    //                                     "$$monthData.weeklyPrices.price",
    //                                     -1,
    //                                   ],
    //                                 },
    //                                 {
    //                                   $arrayElemAt: [
    //                                     "$$monthData.weeklyPrices.price",
    //                                     0,
    //                                   ],
    //                                 },
    //                               ],
    //                             },
    //                             {
    //                               $arrayElemAt: [
    //                                 "$$monthData.weeklyPrices.price",
    //                                 0,
    //                               ],
    //                             },
    //                           ],
    //                         },
    //                         100,
    //                       ],
    //                     },
    //                     else: 0,
    //                   },
    //                 },
    //               },
    //             },
    //           },
    //         },
    //       },
    //       {
    //         $sort: { product: 1 }, // Sort by product name in ascending order
    //       },
    //     ]).exec((err, results) => {
    //       if (err) {
    //         console.error("Error:", err);
    //         res.status(500).json({ message: err });
    //         // Handle the error
    //       } else {
    //         // Handle the results or return them as needed
    //         res.status(200).json(results);
    //       }
    //     });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubmisionRate = async (req, res) => {
  const additionalQueryParams = {};
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
  }
  const query = {
    $and: [
      {
        $expr: {
          $eq: [
            { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
            currentWeek,
          ],
          // $eq: [
          //   { $year: { date: "$created_at", timezone: "Africa/Lagos" } },
          //   // currentYear,
          // ],
        },
      },
      additionalQueryParams,
    ],
  };

  try {
    const totalSubmision = await Form.countDocuments(query);
    const totalEnumerators = await Enumerator.countDocuments(
      req.user.role === "team_lead"
        ? {
            LGA: { $in: req.user.LGA },
            disabled: false,
          }
        : {
            disabled: false,
          }
    );

    const notSubmited = totalEnumerators - totalSubmision;
    res
      .status(200)
      .json({ submited: totalSubmision, notSubmited: notSubmited });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEnumeratorsCount = async (req, res) => {
  try {
    const totalEnumerators = await Enumerator.countDocuments({
      LGA: { $in: req.user.LGA },
      disabled: false,
    });
    const newlyAdded = await Enumerator.countDocuments({
      createdAt: { $gte: startOfMonth, $lt: endOfMonth },
      LGA: { $in: req.user.LGA },
    });
    res.status(200).json({ totalEnumerators, newlyAdded });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLGACount = (req, res) => {
  try {
    const lgas = lgaData;
    // Count the LGAs for each state
    const stateCounts = [];
    for (const lga of lgas) {
      stateCounts.push({
        state: lga.alias,
        lgaCount: lga.lgas.length,
      });
    }
    let totalLga = 0;
    req.user.states.forEach((state) => {
      stateCounts.map((item) => {
        if (item.state === state) {
          totalLga += item.lgaCount;
        }
      });
    });
    res.status(200).json({ totalLga, assignedLga: req.user.LGA.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getYearlyEnumerators = async (req, res) => {
  try {
    const { yearFilter = "" } = req.query;
    const currentYear = yearFilter ? yearFilter : new Date().getFullYear();
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
    Enumerator.aggregate([
      {
        $match: {
          LGA: { $in: req.user.LGA },
          createdAt: {
            $gte: new Date(currentYear, 0, 1), // Start of the current year
            $lte: new Date(currentYear, 11, 31), // End of the current year
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%m-%Y",
              date: "$createdAt",
            },
          },
          added: {
            $sum: 1,
          },
          disabled: {
            $sum: {
              $cond: [{ $eq: ["$disabled", true] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          month: {
            $let: {
              vars: {
                months: months,
              },
              in: {
                $arrayElemAt: [
                  "$$months",
                  { $subtract: [{ $toInt: { $substrCP: ["$_id", 0, 2] } }, 1] },
                ],
              },
            },
          },
          added: 1,
          disabled: 1,
          _id: 0,
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
      {
        $group: {
          _id: null,
          monthlyData: {
            $push: {
              month: "$month",
              added: "$added",
              disabled: "$disabled",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          monthlyData: {
            $map: {
              input: months,
              as: "month",
              in: {
                $let: {
                  vars: {
                    matchedData: {
                      $filter: {
                        input: "$monthlyData",
                        cond: { $eq: ["$$this.month", "$$month"] },
                      },
                    },
                  },
                  in: {
                    $cond: {
                      if: { $gt: [{ $size: "$$matchedData" }, 0] },
                      then: { $arrayElemAt: ["$$matchedData", 0] },
                      else: { month: "$$month", added: 0, disabled: 0 },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $unwind: "$monthlyData",
      },
      {
        $replaceRoot: {
          newRoot: "$monthlyData",
        },
      },
    ]).exec((err, results) => {
      if (err) {
        console.error("Error:", err);
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
