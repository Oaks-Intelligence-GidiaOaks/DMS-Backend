import mongoose from "mongoose";

const { Schema, model } = mongoose;

const auditLogSchema = new Schema(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    ip_address: {
      type: String,
    },
    name: {
      type: String,
    },
    id: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model("AuditLog", auditLogSchema);
