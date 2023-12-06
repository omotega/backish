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
          required:true,
        },
        roleInOrg: {
          type: String,
          enum: ["super-admin", "admin", "guest"],
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
