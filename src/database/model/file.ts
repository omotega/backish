import mongoose from "mongoose";
import { fileInterface } from "../../types/files";
import mongoosePaginate from "mongoose-paginate-v2";

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

fileSchema.plugin(mongoosePaginate);

export default mongoose.model<
  fileInterface,
  mongoose.PaginateModel<fileInterface>
>("File", fileSchema);
