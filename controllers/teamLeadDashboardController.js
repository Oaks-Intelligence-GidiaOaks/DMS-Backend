import Product from "../models/productModel.js";
import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";
import "../utils/dateUtils.js";

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
  currentWeek,
  currentWeek - 1,
  currentWeek - 2,
  currentWeek - 3,
];

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
          weeklyPrice.push({ weekNo, price });
          totalPrice += price;
        }

        const priceChange = calculatePercentageChange(
          weeklyPrice[0].price,
          weeklyPrice[3].price
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
    additionalQueryParams.team_lead_id = req.user._id;
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

  try {
    const totalSubmision = await Form.countDocuments(query);
    const totalEnumerators = await Enumerator.countDocuments({
      user: req.user._id,
    });
    const notSubmited = totalEnumerators - totalSubmision;
    res
      .status(200)
      .json({ submited: totalSubmision, notSubmited: notSubmited });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
