import httpStatus from "http-status";
import folderservices from "../services/folderservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { foldername, orgId, description } = req.body;
  const response = await folderservices.createFolder({
    folderName: foldername,
    orgId: orgId,
    description: description,
    userId: _id,
  });
  res
    .status(httpStatus.CREATED)
    .json({ status: true, message: "folder created", data: response });
});

const starFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.starFolder({
    orgId: orgId,
    folderId: folderId,
  });

  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder starred", data: response });
});

const unstarFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.unstarFolder({
    orgId: orgId,
    folderId: folderId,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder unstarred", data: response });
});

const getAllStarredFolders = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { page = 1, limit = 10 } = req.query as unknown as {
    page: number;
    limit: number;
  };
  const { orgId } = req.params;
  const response = await folderservices.listAllStarredFolders({
    orgId: orgId,
    page: page,
    limit: limit,
  });
  res.status(httpStatus.OK).json({
    status: true,
    message: "folders fetched succesfully",
    data: response,
  });
});

const updateFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId } = req.params;
  const { orgId, foldername, description } = req.body;

  const response = await folderservices.updateFolder({
    folderId,
    foldername,
    description,
    userId: _id,
    orgId,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder updated", data: response });
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, folderId } = req.params;
  const response = await folderservices.deleteFolder({
    orgId: orgId,
    folderId: folderId,
    userId: _id,
  });
  res.status(httpStatus.OK).json({
    status: true,
    message: `Folder ${folderId} deleted`,
    data: response,
  });
});

const getAllUnstarredFolders = catchAsync(
  async (req: Request, res: Response) => {
    const { _id } = req.User;
    const { page = 1, limit = 10 } = req.query as unknown as {
      page: number;
      limit: number;
    };

    const { orgId } = req.params;

    const response = await folderservices.listAllUnstarredFolders({
      orgId: orgId,
      page: page,
      limit: limit,
    });

    res.status(httpStatus.OK).json({
      status: true,
      message: "folders fetched succesfully",
      data: response,
    });
  }
);

const getAllFolders = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, limit = 10 } = req.query as unknown as {
    page: number;
    limit: number;
  };
  const { orgId } = req.params;
  const response = await folderservices.getAllFolders({
    orgId: orgId,
    page: page,
    limit: limit,
  });
  res.status(httpStatus.OK).json({
    status: true,
    message: "folders fetched succesfully",
    data: response,
  });
});

const folderAccess = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId, collaboratorId } = req.body;
  const response = await folderservices.addFolderAccess({
    collaboratorId: collaboratorId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder Access added", data: response });
});

const folderArchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.archiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder Archived", data: response });
});

const folderUnarchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.unarchiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder unArchived", data: response });
});

const folderCopy = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { copiedFolderId, copiedToFolderId, orgId } = req.body;
  const response = await folderservices.copyFolder({
    copiedFolderId: copiedFolderId,
    copiedToFolderId: copiedToFolderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder copied", data: response });
});

const folderTrash = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { folderId } = req.params;
  const response = await folderservices.trashFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder trashed", data: response });
});

const folderunTrash = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { folderId } = req.params;
  const response = await folderservices.untrashFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "folder untrashed", data: response });
});
const removefolderAccess = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId, collaboratorId } = req.params;
  const response = await folderservices.removeCollaboratorFolderAccess({
    collaboratorId: collaboratorId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "collaborator removed", data: response });
});

export default {
  createFolder,
  unstarFolder,
  starFolder,
  getAllStarredFolders,
  getAllFolders,
  getAllUnstarredFolders,
  updateFolder,
  folderAccess,
  deleteFolder,
  folderArchive,
  folderUnarchive,
  folderCopy,
  folderTrash,
  folderunTrash,
  removefolderAccess,
};
