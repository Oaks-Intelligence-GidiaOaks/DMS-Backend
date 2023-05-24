import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";
import "../utils/dateUtils.js";

// function getLastWeeksDate() {
//   const now = new Date();
//   return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
// }
const currentWeek = new Date().getWeek();

// get response Tracker api/v1/form_response/response_tracker
export const getResponseTracker = catchAsyncErrors(async (req, res, next) => {
  const { page } = req.query;

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

  // const currentPage = page || 1;
  // const skip = (currentPage - 1) * 10;
  try {
    let enumeratorIds;
    let results;
    const totalSubmision = await Form.countDocuments(query);
    const totalEnumerators = await Enumerator.countDocuments({
      user: req.user._id,
    });
    const enumerators = await Enumerator.find({ user: req.user._id }).exec(
      (err, enumerators) => {
        if (err) {
          console.error("Error:", err);
          // res.status(500).json({ message: err.message });
        } else {
          enumeratorIds = enumerators.map((enumerator) => enumerator._id);

          //get response
          const data = Form.find({
            created_by: { $in: enumeratorIds },
            $expr: {
              $eq: [
                { $week: { date: "$created_at", timezone: "Africa/Lagos" } },
                currentWeek,
              ],
            },
          }).exec((err, data) => {
            if (err) {
              console.error("Error2:", err);
            } else {
              // Create a map of enumeratorId to response for easier lookup
              const responseMap = new Map();
              data.forEach((response) => {
                responseMap.set(response.created_by.toString(), response);
              });
              // Iterate through the enmerators and determine the status
              results = enumerators.map((enumerator) => {
                const response = responseMap.get(enumerator._id.toString());
                const status = !!response;
                const state = response ? response.state : null;
                const lga = response ? response.lga : null;
                const created_at = response ? response.created_at : null;

                return {
                  first_name: enumerator.firstName,
                  last_name: enumerator.lastName,
                  state,
                  lga,
                  created_at,
                  status,
                };
              });
              res
                .status(200)
                .json({ results, totalEnumerators, totalSubmision });
            }
          });
        }
      }
    );

    // res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});
