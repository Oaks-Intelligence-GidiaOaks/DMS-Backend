import Form from "../models/formModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";

function getLastWeeksDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
}

// get response Tracker api/v1/form_response/response_tracker
export const getResponseTracker = catchAsyncErrors(async (req, res, next) => {
  const {
    searchQuery = "",
    regionFilter = "",
    stateFilter = "",
    lgaFilter = "",
    page,
  } = req.query;

  const query = {};
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (stateFilter !== "") {
    query.state = stateFilter;
  }
  if (lgaFilter !== "") {
    query.lga = lgaFilter;
  }
  if (regionFilter !== "") {
    query.region = regionFilter;
  }
  if (req?.user?.role === "team_lead") {
    query.team_lead_id = req.user._id;
  }
  query.created_at = { $gte: getLastWeeksDate() };

  const currentPage = page || 1;
  const skip = (currentPage - 1) * 10;
  try {
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
