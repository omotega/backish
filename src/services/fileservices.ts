import path from "path";
import fs from "fs";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
import messages from "../utils/messages";
import filequeries from "../database/queries/file";
import filemanagement from "../utils/filemanagement";


const getFilePath = (fileName: string, fileId: string) =>
  path.normalize(path.join("src", "uploads", `file~${fileId}~${fileName}`));

const directoryPath = path.join("src", "uploads");

const initiateFileUpload = async (fileName: string) => {
  if (!fileName)
    throw new AppError({
      httpCode: httpStatus.BAD_REQUEST,
      description: messages.MISSING_FILE_NAME,
    });
  const file = await filequeries.createFile({ filename: fileName });
  if (!file)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.FILE_CREATION_ERROR,
    });
  const fileId = file.id;
  const createath = filemanagement.createDirectory(directoryPath);
  const filePath = getFilePath(fileName, fileId);
  const result = fs.createWriteStream(filePath, {
    flags: "w",
  });
  const response = {
    message: "file upload initiated succesfully",
    data: file.id,
  };
  return response;
};

export default {
  initiateFileUpload,
};
