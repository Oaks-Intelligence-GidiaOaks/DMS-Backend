import mongoose from "mongoose";
import AuditTrail from "./auditTrailModel.js";

const { Schema, model } = mongoose;

const lgaRouteSchema = new Schema({
  lga: { type: String, required: true },
  routes: [],
});

// populate audit trail
lgaRouteSchema.pre("save", function (next) {
  if (this.isNew) {
    // Document is new, store "create" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "LGARoute",
      documentId: this._id,
      action: "create",
    });
    auditTrailEntry.save();
  } else {
    // Document is being updated, store "update" action
    const auditTrailEntry = new AuditTrail({
      collectionName: "LGARoute",
      documentId: this._id,
      action: "update",
    });
    auditTrailEntry.save();
  }
  next();
});

export default model("LGARoute", lgaRouteSchema);
