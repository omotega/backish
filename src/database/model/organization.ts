import mongoose from "mongoose";
import { Iorganization } from "../../types/organization";

const organizationSchema = new mongoose.Schema({
  name: {
    type: "string",
  },
});

export default mongoose.model<Iorganization>(
  "Organization",
  organizationSchema
);
