import AuditTrail from "../models/auditTrailModel.js";
import mongoose from "mongoose";

export const getAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    const [result, total] = await Promise.all([
      AuditTrail.find({})
        .populate({
          path: "documentId",
          populate: {
            path: "organization_id craeted_by updated_by",
          },
        })
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 }),

      AuditTrail.countDocuments({}),
    ]);

    res.status(200).json({
      result,
      currentPage,
      totalPages: Math.ceil(total / pageLimit),
      totalRecords: total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
