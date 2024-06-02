import mongoose from "mongoose";
import { Iorganization } from "../../types/organization";

const organizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: "string",
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Iorganization>(
  "Organization",
  organizationSchema
);
