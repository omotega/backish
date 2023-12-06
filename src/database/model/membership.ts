import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  expiresAt: {
    type: Date,
  },
  orgName: {
    type: String,
  },
  email: {
    type: String,
  },
  token: {
    type: String,
  },
});

export default mongoose.model("Membership", membershipSchema);
