import mongoose from 'mongoose';
import { fileInterface } from '../../types/files';
import mongoosePaginate from 'mongoose-paginate-v2';
import { DateTime } from 'luxon';

const fileSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    folderId: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
      },
    ],
    filename: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    format: {
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
      type: String,
    },
    isTrashed: {
      type: Boolean,
      default: false,
    },
    isExpired: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    existInHomeDirectory: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

fileSchema.pre('save', function (next) {
  if (this.isTrashed && !this.isExpired) {
    this.isExpired = DateTime.now().plus({ days: 30 }).toJSDate();
  }
  next();
});

fileSchema.plugin(mongoosePaginate);

export default mongoose.model<fileInterface, mongoose.PaginateModel<fileInterface>>(
  'File',
  fileSchema
);
