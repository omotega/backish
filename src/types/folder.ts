import { Iorganization } from './organization';
import { Iuser } from './user';

export interface folderModelInterface {
  _id: string;
  folderName: string;
  content: string;
  orgId: Iorganization['id'];
  collaborators: [Iuser['_id']];
  description: string;
  permission?: string;
  isPinned?: boolean;
  isStarred?: boolean;
  isDeleted?: boolean;
  isLocked?: boolean;
  createdBy: string;
  isArchived?: boolean;
  isTrashed?: boolean;
  existInHomeDirectory?: boolean;
}
