import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    foldername: {
      type: String,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    description: {
      type: String,
    },
    collaborator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    Permission: {
      type: String,
    },
    isPinned: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Folder", folderSchema);
