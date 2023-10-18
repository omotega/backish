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
  const { folderId, orgId } = req.body;
  const response = await folderservices.listAllStarredFolders({
    orgId: orgId,
    folderId: folderId,
    page: page,
    limit: limit,
  });
  res
    .status(httpStatus.OK)
    .json({
      status: true,
      message: "folders fetched succesfully",
      data: response,
    });
});

export default {
  createFolder,
  unstarFolder,
  starFolder,
  getAllStarredFolders
};
