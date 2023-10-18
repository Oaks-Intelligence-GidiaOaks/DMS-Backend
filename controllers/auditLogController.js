import AuditLog from "../models/auditLogModel.js";
import mongoose from "mongoose";

export const createAuditLog = async ({
  title,
  description,
  name,
  id,
  ip_address,
}) => {
  try {
    const auditLog = await AuditLog.create({
      title,
      description,
      name,
      id,
      ip_address,
    });
    return true;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLog = async (req, res) => {
  const ipAddress = req.socket.remoteAddress;
  try {
    const { page = 1, limit = 20, start, end } = req.query;

    const currentPage = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (currentPage - 1) * pageLimit;

    let query = {};
    if (start && end) {
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: startDate, $lte: endDate };
    } else {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const lastDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      lastDayOfMonth.setHours(23, 59, 59, 999);

      query.createdAt = { $gte: firstDayOfMonth, $lte: lastDayOfMonth };
    }

    const [result, total] = await Promise.all([
      AuditLog.find(query).skip(skip).limit(pageLimit).sort({ createdAt: -1 }),
      AuditLog.countDocuments(query),
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
