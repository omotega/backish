import path from "path";
import fs from "fs/promises";
import { AppError } from "../utils/errors";
import filemanagement from "../utils/filemanagement";
import filemodel from "../database/model/file";
import Helper from "../utils/helpers";
import cloudinaryservices from "../utils/cloudinary";
import httpStatus from "http-status";
import helperServices from "./helper-services";

const directoryPath = path.join("src", "uploads");

//   if (!fileName)
//     throw new AppError({
//       httpCode: httpStatus.BAD_REQUEST,
//       description: messages.MISSING_FILE_NAME,
//     });
//   const file = await filemodel.create({ filename: fileName });
//   if (!file)
//     throw new AppError({
//       httpCode: httpStatus.INTERNAL_SERVER_ERROR,
//       description: messages.FILE_CREATION_ERROR,
//     });
//   const fileId = file._id.toString();
//   filemanagement.createDirectory(directoryPath);
//   const filePath = getFilePath(fileName, fileId);
//   fs.createWriteStream(filePath, {
//     flags: "w",
//   });
//   const response = {
//     message: "file upload initiated succesfully",
//     data: { fileId: file._id, fileName: file.filename },
//   };
//   return response;
// };

//   folderId,
//   fileId,
//   contentRange,
//   requestHeader,
// }: {
//   folderId: string;
//   fileId: string;
//   contentRange: string;
//   requestHeader: any;
// }) => {
//   const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/);
//   if (!match)
//     throw new AppError({
//       httpCode: httpStatus.BAD_REQUEST,
//       description: 'Invalid "Content-Range" format',
//     });
//   const rangeStart = Number(match[1]);
//   const rangeEnd = Number(match[2]);
//   const fileSize = Number(match[3]);

//   if (
//     rangeStart >= fileSize ||
//     rangeStart >= rangeEnd ||
//     rangeStart >= rangeEnd
//   )
//     throw new AppError({
//       httpCode: httpStatus.BAD_REQUEST,
//       description: 'Invalid "Content-Range" provided',
//     });

//     const busboy = new Busboy({headers: requestHeader})
// };

const uploadFile = async ({
  folderId,
  uploadedFile,
  userId,
  orgId,
}: {
  folderId?: string;
  uploadedFile: any;
  userId: string;
  orgId: string;
}) => {
  const checkUser = await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  uploadedFile.map((item: any) => {
    if (item.path.indexOf("\0") !== -1)
      throw new AppError({
        httpCode: httpStatus.BAD_REQUEST,
        description: "Error: Filename must not contain null bytes",
      });
  });
  if (!uploadedFile)
    throw new AppError({
      httpCode: httpStatus.BAD_REQUEST,
      description: "No file passed",
    });

  const fileInUploadDirectory = await fs.readdir(directoryPath);

  const checkFileUploadstatus = await Promise.all(
    fileInUploadDirectory.map(async (item: any) => {
      const data = await fs.stat(`${directoryPath}/${item}`);
      return { file: item, size: data.size };
    })
  );

  if (uploadedFile.length !== checkFileUploadstatus.length) return;

  const sortedFiles = (uploadedFile as any)
    .slice(0)
    .sort((a: any, b: any) => a.size - b.size);
  const sortedFile = checkFileUploadstatus.sort((a, b) => a.size - b.size);
  let fileArray: Array<any> = [];
  let dataArray: Array<any> = [];

  for (let i = 0; i < sortedFiles.length; i++) {
    if (sortedFiles[i].size !== sortedFile[i].size) {
      fileArray.push(sortedFiles[i].filename);
    } else {
      if (sortedFiles[i].size === sortedFile[i].size) {
        const md5Hash = await Helper.md5Generator(sortedFiles[i].path);
        const response = await cloudinaryservices.uploadImage(
          sortedFiles[i].path
        );
        if (
          !md5Hash &&
          !response?.url &&
          !response?.size &&
          !response?.publicId
        ) {
          fileArray.push(sortedFiles[i].filename);
        }
        const fileSize = Helper.formatFileSize(response?.size);
        const createFile = await filemodel.create({
          filename: sortedFiles[i].filename,
          Format: sortedFiles[i].mimetype,
          url: response?.url,
          md5Hash: md5Hash,
          addedBy: userId,
          size: `${fileSize}(${response?.size} bytes)`,
          folderId: folderId,
        });
        if (createFile) dataArray.push(createFile);
        filemanagement.deleteFileInDirectory(sortedFiles[i].path);
      }
    }
  }
  return {
    status: true,
    message: "files uploaded succesfully",
    data: dataArray,
    failedUploadedFiles: fileArray,
  };
};

export default {
  uploadFile,
};
