import mongoose from "mongoose";
import { Iuser } from "../../types/user";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: "String",
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    orgStatus: [
      {
        orgId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          _id: false,
        },
        roleInOrg: {
          type: String,
          enum: ["super-admin", "admin", "user"],
          default: "super-admin",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Iuser>("User", userSchema);
