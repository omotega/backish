import { Iorganization } from './organization';
import { Iuser } from './user';

export interface orgMember {
  orgId: Iorganization['id'];
  memberId: Iuser['_id'];
  role: string;
  userName: string;
}
