import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { folderModel } from "../../types/folder";

const folderSchema = new mongoose.Schema(
  {
    foldername: {
      type: String,
      unique: true,
      required: true,
    },
    content: {
      type: String,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    description: {
      type: String,
    },
    isPinned: {
      type: String,
    },
    isarchived: {
      type: Boolean,
      default: false,
    },
    isStarred: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
folderSchema.plugin(mongoosePaginate);

export default mongoose.model<folderModel, mongoose.PaginateModel<folderModel>>(
  "Folder",
  folderSchema
);
