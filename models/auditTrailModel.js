import mongoose from "mongoose";

const { Schema, model } = mongoose;

const auditTrailSchema = new Schema(
  {
    collectionName: {
      type: String,
    },
    action: {
      type: String,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "collectionName",
    },
  },
  { timestamps: true }
);

export default model("AuditTrail", auditTrailSchema);
