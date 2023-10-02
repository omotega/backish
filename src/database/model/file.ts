import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  filename: {
    type: String,
  },
  url: {
    type: String,
  },
  Format: {
    type: String,
  },
  isStarred: {
    type: Boolean,
    default: false,
  },
  isarchived: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  coomments: {
    type: String,
  },
  md5Hash: {
    type: String,
  },
  permission: {
    type: String,
  },
  password: {
    type: String,
  },
  lastAccessed: {
    type: String,
  },
  addedBy: {
    type: mongoose.Schema.Types.String,
    ref: 'User'

  },
});

export default mongoose.model("File", fileSchema);
