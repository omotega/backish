import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    folderId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Folder",
      },
    ],
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    Format: {
      type: String,
    },
    size: {
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
    md5Hash: {
      type: String,
    },
    permission: {
      type: String,
    },
    password: {
      type: String,
    },
    addedBy: {
      type: mongoose.Schema.Types.String,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("File", fileSchema);
