import httpStatus from 'http-status';
import folderservices from '../services/folderservices';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchasync';

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.params;
  const { folderId } = req.query as unknown as {
    folderId: string;
  };
  const { foldername, description } = req.body;
  const response = await folderservices.createFolder({
    folderName: foldername,
    folderId: folderId,
    orgId: orgId,
    description: description,
    userId: _id,
  });
  res.status(httpStatus.CREATED).send(response);
});

const starFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.query as unknown as {
    folderId: string;
    orgId: string;
  };
  const response = await folderservices.starFolder({
    userId: _id,
    orgId: orgId,
    folderId: folderId,
  });

  res.status(httpStatus.OK).send(response);
});

const unstarFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.query as unknown as {
    folderId: string;
    orgId: string;
  };
  const response = await folderservices.unstarFolder({
    userId: _id,
    orgId: orgId,
    folderId: folderId,
  });
  res.status(httpStatus.OK).send(response);
});

const getAllStarredFolders = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { page, limit, orgId } = req.query as unknown as {
    page: number;
    limit: number;
    orgId: string;
  };
  const response = await folderservices.listAllStarredFolders({
    orgId: orgId,
    page: page,
    limit: limit,
  });
  res.status(httpStatus.OK).send(response);
});

const updateFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId } = req.params;
  const { orgId, folderName, description } = req.body;

  const response = await folderservices.updateFolder({
    folderId,
    folderName,
    description,
    userId: _id,
    orgId,
  });
  res.status(httpStatus.OK).send(response);
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, folderId } = req.params;
  const response = await folderservices.deleteFolder({
    orgId: orgId,
    folderId: folderId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const getAllUnstarredFolders = catchAsync(async (req: Request, res: Response) => {
  const { page = 1, orgId } = req.query as unknown as {
    page: number;
    limit: number;
    orgId: string;
  };

  const response = await folderservices.listAllUnstarredFolders({
    orgId: orgId,
    page: page,
  });

  res.status(httpStatus.OK).send(response);
});

const getAllFolders = catchAsync(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 10,
    orgId,
  } = req.query as unknown as {
    page: number;
    limit: number;
    orgId: string;
  };
  const response = await folderservices.getAllFolders({
    orgId: orgId,
    page: page,
    limit: limit,
  });
  res.status(httpStatus.OK).send(response);
});

const folderAccess = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId } = req.params;
  const { orgId, collaboratorId } = req.body;
  const response = await folderservices.addFolderAccess({
    collaboratorId: collaboratorId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const folderArchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, folderId } = req.body;
  const response = await folderservices.archiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const folderUnarchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.unarchiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
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
  res.status(httpStatus.OK).send(response);
});

const folderTrash = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.trashFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const untrashFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, folderId } = req.body;
  const response = await folderservices.untrashFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const removefolderAccess = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId, collaboratorId } = req.body;
  const response = await folderservices.removeCollaboratorFolderAccess({
    collaboratorId: collaboratorId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const moveFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId, moveFromFolderId, moveToFolderId } = req.body;
  const response = await folderservices.moveFolder({
    moveFromFolderId: moveFromFolderId,
    moveToFolderId: moveToFolderId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const pinFolder = catchAsync(async (req: Request, res: Response) => {
  const { folderId, orgId } = req.body;
  const response = await folderservices.pinFolder({
    folderId: folderId,
    orgId: orgId,
  });
  res.status(httpStatus.OK).send(response);
});

const unpinFolder = catchAsync(async (req: Request, res: Response) => {
  const { folderId, orgId } = req.body;
  const response = await folderservices.unPinFolder({
    folderId: folderId,
    orgId: orgId,
  });
  res.status(httpStatus.OK).send(response);
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
  untrashFolder,
  removefolderAccess,
  moveFolder,
  pinFolder,
  unpinFolder,
};
