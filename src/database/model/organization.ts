import mongoose from "mongoose";
import { Iorganization } from "../../types/organization";

const organizationSchema = new mongoose.Schema(
  {
    orgName: {
      type: "string",
      unique: true,
    },
    invitedEmails: [
      {
        type: String,
        unique: true,
      },
    ],
    roleInOrganization: {
      type: String,
      enum: ["super-admin", "admin", "guest"],
      default: "super-admin",
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
