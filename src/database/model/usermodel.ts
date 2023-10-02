import mongoose from "mongoose";
import { Iuser } from "../../types/user";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: "String",
      unique: true,
    },
    password: {
      type: String,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<Iuser>("User", userSchema);
