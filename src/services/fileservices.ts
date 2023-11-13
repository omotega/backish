import path from "path";
import fs from "fs/promises";
import { AppError } from "../utils/errors";
import filemanagement from "../utils/filemanagement";
import filemodel from "../database/model/file";
import Helper from "../utils/helpers";
import cloudinaryservices from "../utils/cloudinary";
import httpStatus from "http-status";
import helperServices from "./helper-services";
import foldermodel from "../database/model/folder";

const directoryPath = path.join("src", "uploads");

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
  await helperServices.checkIfUserBelongsToOrganization({
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

  if (uploadedFile.length !== checkFileUploadstatus.length) {
    await Promise.all(
      fileInUploadDirectory.map(async (item: any) => {
        filemanagement.deleteFileInDirectory(`${directoryPath}/${item}`);
      })
    );
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "file upload error.Please try again",
    });
  }

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

const addFiletoFolder = async ({
  fileId,
  folderId,
  userId,
  orgId,
}: {
  fileId: string;
  folderId: string;
  userId: string;
  orgId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const folderExist = await foldermodel
    .findOne({
      _id: folderId,
      orgId: orgId,
    })
    .lean();

  if (!folderExist) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Folder does not exist",
    });
  }

  const fileExist = await filemodel
    .findById({
      _id: fileId,
      orgId: orgId,
    })
    .lean();

  if (!fileExist) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: "File does not exist",
    });
  }

  const addFile = await filemodel
    .findOneAndUpdate(
      { folderId: { $in: [folderId] } },
      { $push: { files: fileId } },
      { new: true }
    )
    .lean();

  if (!addFile) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error occurred, could not add File to new Folder",
    });
  }

  return addFile;
};

const fetchAllFilesInFolder = async ({
  orgId,
  folderId,
  userId,
  page,
}: {
  orgId: string;
  folderId: string;
  userId: string;
  page: number;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const options = {
    page: page,
    limit: 10,
    sort: { createdAt: "desc" },
    lean: true,
  };
  const allfiles = await filemodel.paginate(
    { folderId: { $in: [folderId] } },
    options
  );

  if (!allfiles) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error occurred, could not fetch files",
    });
  }
  return allfiles;
};

const moveFile = async ({
  fileId,
  folderId,
  userId,
  orgId,
}: {
  fileId: string;
  folderId?: string;
  userId: string;
  orgId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  let updateQuery: { folderId?: string | null } = {};

  if (folderId) {
    const folderExist = await foldermodel.findOne({
      _id: folderId,
      orgId: orgId,
    });

    if (!folderExist) {
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: "Folder does not exist",
      });
    }

    updateQuery.folderId = folderId;
  } else {
    updateQuery.folderId = null;
  }

  const fileExist = await filemodel.findById({
    _id: fileId,
    orgId: orgId,
  });

  if (!fileExist) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: "File does not exist",
    });
  }

  const addFile = await filemodel
    .findByIdAndUpdate(
      fileId,
      { $push: { files: fileId }, ...updateQuery },
      { new: true }
    )
    .lean();

  if (!addFile) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error occurred, could not move File",
    });
  }

  return addFile;
};

export default {
  uploadFile,
  addFiletoFolder,
  fetchAllFilesInFolder,
  moveFile,
};
