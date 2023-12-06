import { folderModelInterface } from "./folder";
import { Iorganization } from "./organization";

export interface fileInterface {
  id?: string;
  orgId?: Iorganization["_id"];
  folderId?: folderModelInterface["_id"];
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
  addedBy: Iuser["_id"];
}
