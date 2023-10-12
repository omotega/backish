import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    foldername: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    description: {
      type: String,
    },
    Permission: {
      type: String,
    },
    isPinned: {
      type: String,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Folder", folderSchema);
