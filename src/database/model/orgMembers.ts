import mongoose from 'mongoose';
import { userRoleEnum, userRoles } from '../../utils/role';
import { orgMember } from '../../types/groupmembers';
import mongoosePaginate from 'mongoose-paginate-v2';

const orgMembersSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: userRoleEnum,
      default: userRoles.guest,
    },
    active: {
      type: Boolean,
      default: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

orgMembersSchema.plugin(mongoosePaginate);

export default mongoose.model<orgMember, mongoose.PaginateModel<orgMember>>(
  'OrgMembers',
  orgMembersSchema
);
