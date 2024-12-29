import path from 'path';
import fs from 'fs/promises';
import { AppError } from '../utils/errors';
import filemanagement from '../utils/filemanagement';
import filemodel from '../database/model/file';
import Helper from '../utils/helpers';
import cloudinaryservices from '../utils/cloudinary';
import httpStatus from 'http-status';
import helperServices, {
  sortFileNameInAscendingOrder,
  sortFileNameInDescendingOrder,
  sortRecentlyModifiedinAscendingOrder,
  sortRecentlyModifiedinDescendingOrder,
} from './helper-services';
import foldermodel from '../database/model/folder';
import { DateTime } from 'luxon';
import errorMessages from '../utils/messages';

const directoryPath = path.join('src', 'uploads');

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
    if (item.path.indexOf('\0') !== -1)
      throw new AppError({
        httpCode: httpStatus.BAD_REQUEST,
        description: 'Error: Filename must not contain null bytes',
      });
  });
  if (!uploadedFile)
    throw new AppError({
      httpCode: httpStatus.BAD_REQUEST,
      description: 'No file passed',
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
      description: 'file upload error.Please try again',
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
        const response = await cloudinaryservices.uploadImage(sortedFiles[i].path);
        if (!md5Hash && !response?.url && !response?.size && !response?.publicId) {
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
          orgId: orgId,
        });
        if (createFile) dataArray.push(createFile);
        filemanagement.deleteFileInDirectory(sortedFiles[i].path);
      }
    }
  }
  return {
    status: true,
    message: 'files uploaded succesfully',
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

  const addFile = await filemodel.findOneAndUpdate(
    { orgId: orgId, _id: fileId },
    { $push: { folderId: folderId } },
    { new: true }
  );

  if (!addFile) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FILE_NOT_FOUND,
    });
  }

  return { status: true };
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
    sort: { createdAt: 'desc' },
    lean: true,
  };
  const allfiles = await filemodel.paginate({ folderId: { $in: [folderId] } }, options);
  return allfiles;
};

const moveFiles = async ({
  fileId,
  folderId,
  userId,
  orgId,
}: {
  fileId: string | string[];
  folderId?: string;
  userId: string;
  orgId: string;
}) => {
  let fileIds = 0;
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  if (Array.isArray(fileId)) {
    fileIds = fileId.length;
  }

  let updateQuery: { folderId?: string | null } = {};

  if (folderId) {
    const folderExist = await foldermodel.findOne({
      _id: folderId,
      orgId: orgId,
    });

    if (!folderExist) {
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: 'Folder does not exist',
      });
    }

    updateQuery.folderId = folderId;
  } else {
    updateQuery.folderId = null;
  }

  const fileExistQuery = {
    _id: { $in: fileId },
    orgId: orgId,
  };

  const filesExist = await filemodel.find(fileExistQuery);

  if (!filesExist) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: 'One or more files do not exist',
    });
  }

  const updateFileQuery = folderId
    ? { $push: { files: { $each: fileId } }, ...updateQuery }
    : updateQuery;

  const updateFiles = await filemodel.updateMany(
    { _id: { $in: Array.isArray(fileId) ? fileId : [fileId] } },
    updateFileQuery,
    { new: true }
  );

  if (updateFiles.modifiedCount !== fileIds) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error occurred, could not move file(s)',
    });
  }

  return { userId, folderId, orgId, updateFiles };
};

const getAllFiles = async ({
  orgId,
  userId,
  page,
}: {
  orgId: string;
  userId: string;
  page: number;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const options = {
    page: page,
    sort: { createdAt: 'desc' },
    lean: true,
  };

  const allFiles = await filemodel.find({}, 'filename format', options).exec();

  await filemodel.countDocuments();
  const total = allFiles.length;

  if (!allFiles) return {};

  return {
    total,
    page,
    allFiles,
  };
};

const starFile = async ({
  orgId,
  fileId,
  userId,
}: {
  orgId: string;
  fileId: string;
  userId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  const updatedDetails = await filemodel.findByIdAndUpdate(
    { _id: fileId },
    { isStarred: true },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FILE_NOT_FOUND,
    });
  return updatedDetails;
};

const unstarFile = async ({
  orgId,
  fileId,
  userId,
}: {
  orgId: string;
  fileId: string;
  userId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  const updatedDetails = await filemodel.findByIdAndUpdate(
    { _id: fileId },
    { isStarred: false },
    { new: true }
  );

  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'could not unstar file',
    });
  return updatedDetails;
};

const archiveFile = async ({
  userId,
  orgId,
  fileId,
}: {
  userId: string;
  orgId: string;
  fileId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const file = await filemodel.findOneAndUpdate(
    { _id: fileId, isarchived: false },
    { isarchived: true },
    { new: true }
  );
  if (!file)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'An error ocured, could not archive file',
    });
  return file;
};

const unarchiveFile = async ({
  userId,
  orgId,
  fileId,
}: {
  userId: string;
  orgId: string;
  fileId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const file = await filemodel.findOneAndUpdate(
    { _id: fileId, isarchived: true },
    { isarchived: false },
    { new: true }
  );
  if (!file)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'An error ocured, could not unarchive File',
    });
  return file;
};

const trashFile = async ({
  userId,
  orgId,
  fileId,
}: {
  userId: string;
  orgId: string;
  fileId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const isExpired = DateTime.now().plus({ days: 30 }).toJSDate();

  const trashFileUpdate = await filemodel.findOneAndUpdate(
    { _id: fileId, isTrashed: false },
    { isTrashed: true, isExpired: isExpired },
    { new: true }
  );
  if (!trashFileUpdate)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error ocured, could not trash file',
    });

  return { status: true, message: 'File moved from trash' };
};

const untrashFile = async ({
  userId,
  orgId,
  fileId,
}: {
  userId: string;
  orgId: string;
  fileId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const untrashFileUpdate = await filemodel.findOneAndUpdate(
    { _id: fileId, isTrashed: true },
    { isTrashed: false },
    { new: true }
  );
  if (!untrashFileUpdate)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error ocured, could not untrash file',
    });

  return { status: true, message: 'File removed from trash' };
};

const cleanupFiles = async () => {
  try {
    const currentDate = new Date();

    const expiredFiles = await filemodel.find({
      isTrashed: true,
      isExpired: { $lte: currentDate },
    });

    for (const file of expiredFiles) {
      await filemodel.findByIdAndDelete({ _id: file._id });
    }

    return 'Expired Files deleted successfully';
  } catch (error) {
    console.error(error);
    throw new Error('Error cleaning up expired Files');
  }
};

const renameFile = async ({
  fileId,
  fileName,
  orgId,
  userId,
}: {
  fileId: string;
  fileName: string;
  orgId: string;
  userId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const isFile = await filemodel.findOneAndUpdate(
    { _id: fileId, orgId: orgId },
    { filename: fileName },
    { new: true }
  );
  if (!isFile)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'An error ocured, could not rename File',
    });
  return { status: 'true', message: 'File renamed successfully' };
};

const fileCopy = async ({
  copiedToFolderId,
  fileId,
  orgId,
  userId,
}: {
  copiedToFolderId: string;
  fileId: string | string[];
  orgId: string;
  userId: string;
}) => {
  let fileIds = 0;
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  if (Array.isArray(fileId)) {
    fileIds = fileId.length;
  }
  if (!copiedToFolderId) {
    const fileCopy = await filemodel.updateMany(
      {
        _id: fileId,
        orgId: orgId,
      },
      { $set: { existInHomeDirectory: true } }
    );
    if (!fileCopy)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: 'could not copy file',
      });
    const message = { status: true, message: `file copied successfully` };
    return message;
  } else {
    const fileCopy = await filemodel.updateMany(
      {
        _id: fileId,
        orgId: orgId,
      },
      { $push: { folderId: [copiedToFolderId] } },
      { new: true }
    );
    if (fileCopy.modifiedCount !== fileIds)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: 'could not copy file(s)',
      });
    const message = { status: true, message: `file copied successfully` };
    return message;
  }
};

const fetchAllThrashedFile = async ({
  orgId,
  userId,
  page,
}: {
  orgId: string;
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
    sort: { createdAt: 'desc' },
    lean: true,
  };
  const allThrashedFiles = filemodel.paginate({ orgId: orgId, isTrashed: true }, options);
  return allThrashedFiles;
};

const addPasswordToFile = async ({
  userId,
  orgId,
  fileId,
  password,
}: {
  userId: string;
  fileId: string;
  orgId: string;
  password: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  await helperServices.checkUserPermission(userId, orgId);
  const hash = await Helper.hashPassword(password);
  const lockFile = await filemodel.findOneAndUpdate(
    { orgId: orgId, _id: fileId },
    { $set: { password: hash } }
  );
  if (!lockFile)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FILE_NOT_FOUND,
    });
  const message = { status: true, message: 'file locked with password' };
  return message;
};

const resetPassword = async ({
  userId,
  orgId,
  fileId,
  newPassword,
  token,
}: {
  userId: string;
  fileId: string;
  orgId: string;
  token: string;
  newPassword: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const hash = await Helper.hashPassword(newPassword);
  const file = await filemodel.findOneAndUpdate(
    { orgId: orgId, _id: fileId },
    { $set: { password: hash } }
  );
  if (!file)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FILE_NOT_FOUND,
    });
  const message = { status: true, message: 'file password reset succesfully' };
  return message;
};

const getFileDetails = async ({
  orgId,
  fileId,
  userId,
  password,
}: {
  orgId: string;
  fileId: string;
  userId: string;
  password?: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const isFile = await filemodel.findById(fileId);
  if (!isFile)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FILE_NOT_FOUND,
    });
  return { status: true, message: isFile };
};

const sortFields = {
  recentlyModified: {
    ascending: 'recentlyModifiedInAscendingOrder',
    descending: 'recentlyModifiedIndescendingOrder',
  },
  fileName: {
    ascending: 'FileNameInAscendingOrder',
    descending: 'FileNameInDescendingOrder',
  },
  size: {
    ascending: 'A-Z',
    descending: 'Z-A',
  },
};

const sortFiles = async ({
  orgId,
  userId,
  sortType,
}: {
  orgId: string;
  userId: string;
  sortType: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  switch (sortType) {
    case (sortType = sortFields.fileName.ascending):
      return await sortFileNameInAscendingOrder();
    case (sortType = sortFields.fileName.descending):
      return await sortFileNameInDescendingOrder();
    case (sortType = sortFields.recentlyModified.descending):
      return await sortRecentlyModifiedinDescendingOrder();
    case (sortType = sortFields.recentlyModified.ascending):
      return await sortRecentlyModifiedinAscendingOrder();
    default:
      break;
  }
};

export default {
  uploadFile,
  addFiletoFolder,
  fetchAllFilesInFolder,
  moveFiles,
  getAllFiles,
  starFile,
  unstarFile,
  archiveFile,
  unarchiveFile,
  trashFile,
  untrashFile,
  cleanupFiles,
  fileCopy,
  renameFile,
  fetchAllThrashedFile,
  addPasswordToFile,
  resetPassword,
  getFileDetails,
  sortFiles,
};
