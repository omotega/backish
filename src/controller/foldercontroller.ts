import httpStatus from "http-status";
import folderservices from "../services/folderservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";

const createFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.params;
  const { foldername, description } = req.body;
  const response = await folderservices.createFolder({
    folderName: foldername,
    folderId: folderId,
    orgId: orgId,
    description: description,
    userId: _id,
  });
  res.status(httpStatus.CREATED).json(response);
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

  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
});

const deleteFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, folderId } = req.params;
  const response = await folderservices.deleteFolder({
    orgId: orgId,
    folderId: folderId,
    userId: _id,
  });
  res.status(httpStatus.OK).json(response);
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

    res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
});

const folderArchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.archiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).json(response);
});

const folderUnarchive = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const response = await folderservices.unarchiveFolder({
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
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
  res.status(httpStatus.OK).json(response);
});

const moveFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId, moveFromFolderId, moveToFolderId } = req.params;
  const response = await folderservices.moveFolder({
    moveFromFolderId: moveFromFolderId,
    moveToFolderId: moveToFolderId,
    folderId: folderId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).json(response);
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
  moveFolder,
};
