import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";

function getLastWeeksDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
}

// get response Tracker api/v1/form_response/response_tracker
export const getResponseTracker = catchAsyncErrors(async (req, res, next) => {
  const { page } = req.query;

  const query = {};
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
    let enumeratorIds;
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
            created_at: { $gte: getLastWeeksDate() },
          }).exec((err, data) => {
            if (err) {
              console.error("Error2:", err);
            } else {
              // Create a map of enumeratorId to response for easier lookup
              const responseMap = new Map();
              data.forEach((response) => {
                responseMap.set(response.created_by.toString());
              });

              // Iterate through the applicants and determine the status
              const results = enumerators.map((enumerator) => {
                const status = responseMap.has(enumerator._id.toString());
                return { name: enumerator.firstName, status };
              });

              console.log(results);
              // Handle the results or return them as needed
            }
          });

          res.status(200).json({ enumerators, enumeratorIds, data });
        }
      }
    );

    const totalCount = await Form.countDocuments(query);
    const data = await Form.find(query)
      .populate("created_by")
      .skip(skip)
      .limit(10);

    res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
});
