import httpStatus from "http-status";
import fileServices from "../services/fileservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";

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

export default {
  fileUpload,
  addFileToFolder,
};
