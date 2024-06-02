import mongoose from 'mongoose';
import { MembershipInteface } from '../../types/memebership';
import mongoosePaginate from 'mongoose-paginate-v2';

const membershipSchema = new mongoose.Schema({
  expiresAt: {
    type: Date,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  email: {
    type: String,
  },
  token: {
    type: String,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  valid: {
    type: Boolean,
    default: true,
  },
});

membershipSchema.plugin(mongoosePaginate);

export default mongoose.model<
  MembershipInteface,
  mongoose.PaginateModel<MembershipInteface>
>('Membership', membershipSchema);
