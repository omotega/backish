export interface folderModelInterface {
  _id: string;
  foldername: string;
  content: string;
  orgId: string;
  description: string;
  permission?: string;
  isPinned?: string;
  isStarred?: string;
}
