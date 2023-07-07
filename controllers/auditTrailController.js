import AuditTrail from "../models/auditTrailModel.js";
import mongoose from "mongoose";

export const getAuditLog = async (req, res) => {
  try {
    const { page } = req.query;
    const currentPage = page || 1;
    const skip = (currentPage - 1) * 10;

    const total = await AuditTrail.countDocuments();
    // Query the AuditTrail model and populate the documentId field dynamically based on the collectionName
    const auditTrails = await AuditTrail.find()
      .populate({
        path: "documentId",
        model: function (doc) {
          return mongoose.model(doc.collectionName); // Use the collectionName field to dynamically select the model
        },
      })
      .skip(skip)
      .limit(10);
    res.status(200).json({ total, auditTrails });
    //   .exec((err, auditTrails) => {
    //     if (err) {
    //       console.error(err);
    //     } else {
    //       console.log(auditTrails);
    //     }
    //   });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
