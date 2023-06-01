import mongoose from "mongoose";
import Form from "../models/formModel.js";
import Enumerator from "../models/enumeratorModel.js";
import Product from "../models/productModel.js";
import OtherProduct from "../models/otherProductsModel.js";
import Accomodation from "../models/accomodationModel.js";
import Electricity from "../models/electricityModel.js";
import Transport from "../models/transportModel.js";
import Question from "../models/questionModel.js";
import catchAsyncErrors from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import APIQueries from "../utils/apiQueries.js";
import "../utils/dateUtils.js";

// Helper function to calculate the week number for a given date
function getWeekNumber(date) {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const millisecondsInDay = 86400000;
  return Math.ceil(
    ((date - oneJan) / millisecondsInDay + oneJan.getDay() + 1) / 7
  );
}

const currentWeek = new Date().getWeek();

// get response Tracker api/v1/form_response/response_tracker
export const getResponseTracker = async (req, res) => {
  const { page } = req.query;

  const additionalQueryParams = {};
  if (req?.user?.role === "team_lead") {
    // additionalQueryParams.team_lead_id = req.user._id;
    additionalQueryParams.lga = {
      $in: req.user.LGA,
    };
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
      LGA: { $in: req.user.LGA },
    });
    const enumerators = await Enumerator.find({
      LGA: { $in: req.user.LGA },
    }).exec((err, enumerators) => {
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
              const form_id = response ? response._id : null;

              return {
                first_name: enumerator.firstName,
                last_name: enumerator.lastName,
                id: enumerator.id,
                state,
                lga,
                created_at,
                status,
                form_id,
              };
            });
            res.status(200).json({ results, totalEnumerators, totalSubmision });
          }
        });
      }
    });

    // res.status(200).json({ data, totalCount });
  } catch (error) {
    // return next(new ErrorHandler(error.message, 500));
    res.status(500).json({ message: error.message });
  }
};

export const approveResponse = async (req, res) => {
  // const session = await mongoose.startSession();
  // session.startTransaction();
  try {
    const { ids } = req.body;
    let data = await Promise.all(
      ids.map(async (id) => {
        let formData = await Form.findById(id);
        formData.approved = 1;
        formData.updated_by = req.user._id;
        await formData.save();
        let foodData = await Promise.all(
          formData.foodItems.map(async (item) => {
            let fd = await Product.findById(item.toString());
            fd.approved = 1;
            fd.updated_by = req.user._id;
            await fd.save();
            return fd;
          })
        );
        let transportData = await Promise.all(
          formData.transports.map(async (item) => {
            let td = await Transport.findById(item.toString());
            td.approved = 1;
            td.updated_by = req.user._id;
            await td.save();
            return td;
          })
        );
        let accomodationData = await Promise.all(
          formData.accomodations.map(async (item) => {
            let ad = await Accomodation.findById(item.toString());
            ad.approved = 1;
            ad.updated_by = req.user._id;
            await ad.save();
            return ad;
          })
        );
        let electricityData = await Promise.all(
          formData.electricity.map(async (item) => {
            let ed = await Electricity.findById(item.toString());
            ed.approved = 1;
            ed.updated_by = req.user._id;
            await ed.save();
            return ed;
          })
        );
        let questionData = await Promise.all(
          formData.questions.map(async (item) => {
            let qd = await Question.findById(item.toString());
            qd.approved = 1;
            qd.updated_by = req.user._id;
            await qd.save();
            return qd;
          })
        );
        let otherData = await Promise.all(
          formData.others.map(async (item) => {
            let od = await OtherProduct.findById(item.toString());
            od.approved = 1;
            od.updated_by = req.user._id;
            await od.save();
            return od;
          })
        );
        return {
          foodData,
          transportData,
          accomodationData,
          electricityData,
          questionData,
          otherData,
          formData,
        };
      })
    );
    // await session.commitTransaction();
    res
      .status(200)
      .json({ message: "Form response submitted successfully", data });
  } catch (error) {
    // Rollback any changes made in the database
    // await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    // Ending the session
    // session.endSession();
  }
};

export const getSubmissionTime = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentWeek = getISOWeek(currentDate);

    // Function to get the ISO week number for a given date
    function getISOWeek(date) {
      const dayOfWeek = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    }

    // Query the database for the desired forms
    Form.find({
      lga: {
        $in: req.user.LGA,
      },
    })
      .populate("created_by", "id") // Populate the created_by field with the Enumerator model
      .exec((err, forms) => {
        if (err) {
          console.error(err);
          return;
        }
        // Perform the processing on the forms data here
        const weeklyValues = [];

        // Loop through the forms array and extract the required information

        forms.forEach((form) => {
          // Extract the necessary data from the form object
          const { lga, currentWeek, created_at } = form;
          const submissionTime = created_at.toISOString(); // Convert the created_at field to a string in ISO format

          // Find the corresponding weekly value object in the array for the enumerator
          let weeklyValue = weeklyValues.find((value) => value.lga === lga);

          // If the weekly value object doesn't exist, create a new one
          if (!weeklyValue) {
            weeklyValue = {
              lga,
              weeklyValues: [],
            };

            weeklyValues.push(weeklyValue);
          }

          // Calculate the week number for the submission
          const submissionDate = new Date(submissionTime);
          const submissionWeek = getISOWeek(submissionDate);

          // Create the weekly value object for the submission
          const submissionValue = {
            weekNo: submissionWeek,
            submissionTime: submissionDate.toISOString(),
          };

          // Push the submission value to the weekly values array
          weeklyValue.weeklyValues.push(submissionValue);
        });
        res.status(200).json(weeklyValues);
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllSubmissionTime = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentWeek = getISOWeek(currentDate);

    // Function to get the ISO week number for a given date
    function getISOWeek(date) {
      const dayOfWeek = date.getUTCDay() || 7;
      date.setUTCDate(date.getUTCDate() + 4 - dayOfWeek);
      const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
      return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
    }

    // Query the database for the desired forms
    Form.find()
      .populate("updated_by", "id") // Populate the created_by field with the Enumerator model
      .exec((err, forms) => {
        if (err) {
          console.error(err);
          return;
        }
        // Perform the processing on the forms data here
        const weeklyValues = [];

        // Loop through the forms array and extract the required information

        forms.forEach((form) => {
          // Extract the necessary data from the form object
          const { lga, currentWeek, updated_at } = form;
          const submissionTime = updated_at.toISOString(); // Convert the created_at field to a string in ISO format

          // Find the corresponding weekly value object in the array for the enumerator
          let weeklyValue = weeklyValues.find((value) => value.lga === lga);

          // If the weekly value object doesn't exist, create a new one
          if (!weeklyValue) {
            weeklyValue = {
              lga,
              weeklyValues: [],
            };

            weeklyValues.push(weeklyValue);
          }

          // Calculate the week number for the submission
          const submissionDate = new Date(submissionTime);
          const submissionWeek = getISOWeek(submissionDate);

          // Create the weekly value object for the submission
          const submissionValue = {
            weekNo: submissionWeek,
            submissionTime: submissionDate.toISOString(),
          };

          // Push the submission value to the weekly values array
          weeklyValue.weeklyValues.push(submissionValue);
        });
        res.status(200).json(weeklyValues);
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
