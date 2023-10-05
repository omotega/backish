import httpStatus from "http-status";
import fileServices from "../services/fileservices";
import { Request, Response } from "express";
import catchAsync from "../utils/catchasync";

const requestFileUpload = catchAsync(async (req: Request, res: Response) => {
  const { filename } = req.body;
  const uploadRequest = await fileServices.initiateFileUpload(filename);
  res
    .status(httpStatus.OK)
    .json({ status: true, message: "request succesful", data: uploadRequest });
});

export default {
  requestFileUpload,
};
