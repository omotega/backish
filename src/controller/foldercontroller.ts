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

export default {
  createFolder,
};
