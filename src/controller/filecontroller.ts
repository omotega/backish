import httpStatus from "http-status";
import fileServices from "../services/fileservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";
import fileservices from "../services/fileservices";

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

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "file uploaded succesfully",
    data: response,
  });
});

const addFileToFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;
  const { fileId } = req.params;

  const response = await fileServices.addFiletoFolder({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    fileId: fileId,
  });

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "file added succesfully",
    data: response,
  });
});

const getAllFilesInFolder = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.params;
  const { page } = req.query as unknown as {
    page: number;
  };

  const response = await fileServices.fetchAllFilesInFolder({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    page: page,
  });

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "files fetched succesfully",
    data: response,
  });
});

const moveFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { folderId, orgId } = req.body;

  const fileId = req.params.fileIds.split(",");

  const response = await fileServices.moveFiles({
    userId: _id,
    folderId: folderId,
    orgId: orgId,
    fileId: Array.isArray(fileId) ? fileId : [fileId],
  });

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "file moved succesfully",
    data: response,
  });
});

const getAllFiles = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.params;
  const { page } = req.query as unknown as {
    page: number;
  };

  const response = await fileServices.getAllFiles({
    userId: _id,
    orgId: orgId,
    page: page,
  });

  res.status(httpStatus.CREATED).json({
    status: true,
    message: "files fetched succesfully",
    data: response,
  });
});

const starFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, orgId } = req.params;
  const response = await fileservices.starFile({
    orgId: orgId,
    fileId: fileId,
    userId: _id,
  });

  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file starred", data: response });
});

const unstarFile = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { fileId, orgId } = req.params;
  const response = await fileservices.unstarFile({
    orgId: orgId,
    fileId: fileId,
    userId: _id,
  });

  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file unstarred", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file Archived", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file Unarchived", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file trashed", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file Untrashed", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "File copied", data: response });
})

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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "file renamed", data: response });
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
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "files fetched successfully", data: response });
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
};

