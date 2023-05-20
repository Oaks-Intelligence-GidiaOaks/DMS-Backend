import Product from "../models/productModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";

export const getPriceFluctuation = async (req, res) => {
  const { lgaFilter } = req.query;

  const query = {};
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }

  // Get the current year
  const currentYear = new Date().getFullYear();
  // Generate an array of week numbers from 1 to 4
  const weeks = [1, 2, 3, 4];
  // Array to hold the month names
  const monthNames = [
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
  try {
    // Get the percentage increase or decrease in prices per month
    Product.aggregate([
      {
        $match: {
          lga: lgaFilter, // Replace 'your_created_by' with the desired value for the created_by field
          created_at: {
            $gte: new Date(currentYear, 0, 1), // Start of the current year
            $lte: new Date(currentYear, 11, 31), // End of the current year
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$created_at" }, // Extract the month from the created_at field
            product: "$name", // Group by the product_name field
          },
          weeklyPrices: {
            $push: {
              week: { $week: "$created_at" }, // Extract the week from the created_at field
              price: "$price",
            },
          },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          monthlyPrices: {
            $push: {
              month: {
                $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }],
              }, // Get the month name from the monthNames array
              weeklyPrices: "$weeklyPrices",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          product: "$_id",
          monthlyPrices: {
            $map: {
              input: "$monthlyPrices",
              as: "monthData",
              in: {
                month: "$$monthData.month",
                weeklyPrices: "$$monthData.weeklyPrices",
                priceChange: {
                  $cond: {
                    if: { $gt: [{ $size: "$$monthData.weeklyPrices" }, 1] },
                    then: {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: [
                                {
                                  $arrayElemAt: [
                                    "$$monthData.weeklyPrices.price",
                                    -1,
                                  ],
                                },
                                {
                                  $arrayElemAt: [
                                    "$$monthData.weeklyPrices.price",
                                    0,
                                  ],
                                },
                              ],
                            },
                            {
                              $arrayElemAt: [
                                "$$monthData.weeklyPrices.price",
                                0,
                              ],
                            },
                          ],
                        },
                        100,
                      ],
                    },
                    else: 0,
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: { product: 1 }, // Sort by product name in ascending order
      },
    ]).exec((err, results) => {
      if (err) {
        console.error("Error:", err);
        res.status(500).json({ message: err });
        // Handle the error
      } else {
        // Handle the results or return them as needed
        res.status(200).json(results);
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
