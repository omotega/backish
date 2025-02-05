import httpStatus from 'http-status';
import fileServices from '../services/fileservices';
import { Request, Response } from 'express';
import catchAsync from '../utils/catchasync';
import fileservices from '../services/fileservices';

const fileUpload = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const uploadedFile = req.files;

  const response = await fileServices.uploadFile({
    userId: _id,
    folderId: folderId,
    uploadedFile: uploadedFile,
    orgId: orgId,
  });
  res.status(httpStatus.OK).send(response);
});

const addFileToFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, orgId, folderId } = req.body;

  const response = await fileServices.addFiletoFolder({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    fileId: fileId,
  });

  res.status(httpStatus.OK).send(response);
});

const getAllFilesInFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { page, folderId, orgId } = req.query as unknown as {
    page: number;
    folderId: string;
    orgId: string;
  };

  const response = await fileServices.fetchAllFilesInFolder({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    page: page,
  });

  res.status(httpStatus.OK).send(response);
});

const moveFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;

  const fileId = req.params.fileIds.split(',');

  const response = await fileServices.moveFiles({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    fileId: Array.isArray(fileId) ? fileId : [fileId],
  });

  res.status(httpStatus.OK).send(response);
});

const getAllFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { page, orgId } = req.query as unknown as {
    page: number;
    orgId: string;
  };

  const response = await fileServices.getAllFiles({
    userId: _id,
    orgId: orgId,
    page: page,
  });

  res.status(httpStatus.OK).send(response);
});

const starFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, orgId } = req.body;
  const response = await fileservices.starFile({
    orgId: orgId,
    fileId: fileId,
    userId: _id,
  });

  res.status(httpStatus.OK).send(response);
});

const unstarFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, orgId } = req.body;
  const response = await fileservices.unstarFile({
    orgId: orgId,
    fileId: fileId,
    userId: _id,
  });

  res.status(httpStatus.OK).send(response);
});

const archiveFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { fileId } = req.params;
  const response = await fileservices.archiveFile({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const unarchiveFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { fileId } = req.params;
  const response = await fileservices.unarchiveFile({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const trashFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { fileId } = req.params;
  const response = await fileservices.trashFile({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const untrashFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.body;
  const { fileId } = req.params;
  const response = await fileservices.untrashFile({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const copyFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, folderId, orgId } = req.query as {
    fileId: string;
    folderId: string;
    orgId: string;
  };
  const response = await fileservices.fileCopy({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
    copiedToFolderId: folderId,
  });
  res.status(httpStatus.OK).send(response);
});

const updateFileName = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileName } = req.body;
  const { fileId, orgId } = req.params;
  const response = await fileservices.renameFile({
    fileId: fileId,
    orgId: orgId,
    userId: _id,
    fileName: fileName,
  });
  res.status(httpStatus.OK).send(response);
});

const getAllThrashedFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, page } = req.query as unknown as {
    orgId: string;
    page: number;
  };
  const response = await fileservices.fetchAllThrashedFile({
    orgId: orgId,
    userId: _id,
    page: page,
  });
  res.status(httpStatus.OK).send(response);
});

const lockFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, fileId } = req.query as unknown as {
    orgId: string;
    fileId: string;
  };
  const { password } = req.body;
  const response = await fileservices.addPasswordToFile({
    orgId: orgId,
    userId: _id,
    fileId: fileId,
    password: password,
  });
  res.status(httpStatus.OK).send(response);
});

const resetFilePassword = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, fileId } = req.query as unknown as {
    orgId: string;
    fileId: string;
  };
  const { oldPassword, newPassword, token } = req.body;
  const response = await fileservices.resetPassword({
    orgId: orgId,
    userId: _id,
    fileId: fileId,
    newPassword: newPassword,
    token,
  });
  res.status(httpStatus.OK).send(response);
});

const sortedFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, sortType } = req.query as unknown as {
    orgId: string;
    sortType: string;
  };
  const response = await fileservices.sortFiles({
    orgId: orgId,
    userId: _id,
    sortType: sortType,
  });
  res.status(httpStatus.OK).send(response);
});

export default {
  fileUpload,
  addFileToFolder,
  getAllFilesInFolder,
  moveFile,
  getAllFiles,
  starFile,
  unstarFile,
  archiveFile,
  unarchiveFile,
  trashFiles,
  untrashFiles,
  copyFiles,
  updateFileName,
  getAllThrashedFiles,
  lockFile,
  resetFilePassword,
  sortedFile,
};
