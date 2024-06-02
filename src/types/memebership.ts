import { Iorganization } from './organization';
import { Iuser } from './user';

export interface MembershipInteface {
  expiresAt: Date;
  orgId: Iorganization['id'];
  email: string;
  token: string;
  userId: Iuser['_id'];
  valid: boolean;
}
