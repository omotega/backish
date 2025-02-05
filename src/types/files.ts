import { folderModelInterface } from './folder';
import { Iorganization } from './organization';
import { Iuser } from './user';

export interface fileInterface {
  id?: string;
  orgId?: Iorganization['id'];
  folderId?: folderModelInterface['_id'];
  filename?: string;
  url?: string;
  format?: string;
  size?: string;
  isStarred: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  md5Hash: string;
  permission?: string;
  password?: string;
  isTrashed: boolean;
  addedBy?: string;
  isLocked: boolean;
}
