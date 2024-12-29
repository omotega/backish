import httpStatus from 'http-status';
import foldermodel from '../database/model/folder';
import filemodel from '../database/model/file';
import { AppError } from '../utils/errors';
import helperServices from './helper-services';
import { DateTime } from 'luxon';
import mongoose from 'mongoose';
import errorMessages from '../utils/messages';
import Folder from '../database/model/folder';
import { response } from 'express';

const createFolder = async ({
  userId,
  folderName,
  orgId,
  description,
  folderId,
}: {
  userId: string;
  folderName: string;
  orgId: string;
  description: string;
  folderId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  const user = await helperServices.getUserdetailsById(userId);
  const folderExist = await foldermodel.findOne({
    folderName: folderName,
    orgId: orgId,
  });
  if (folderExist)
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `Folder with name ${folderName} already exist`,
    });

  const folderData = {
    folderName: folderName,
    orgId: orgId,
    description: description,
    collaborators: [userId],
    createdBy: user.name,
    existInHomeDirectory: folderId ? false : true,
    folderId: folderId ? [folderId] : [],
  };
  await foldermodel.create(folderData);
  return { status: true, response: 'folder created succesfully' };
};

const starFolder = async ({
  orgId,
  folderId,
  userId,
}: {
  orgId: string;
  folderId: string;
  userId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  const updatedDetails = await foldermodel.findByIdAndUpdate(
    { _id: folderId, isStarred: false },
    { isStarred: true },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  return { status: true, message: 'Folder starred successfully' };
};

const unstarFolder = async ({
  orgId,
  folderId,
  userId,
}: {
  orgId: string;
  folderId: string;
  userId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  const updatedFolder = await foldermodel.findByIdAndUpdate(
    { _id: folderId },
    { isStarred: false },
    { new: true }
  );
  if (!updatedFolder)
    throw new AppError({
      httpCode: httpStatus.UNPROCESSABLE_ENTITY,
      description: 'could not unstar folder',
    });
  return { status: true, message: 'Folder unstarred successfully' };
};

const listAllStarredFolders = async ({
  orgId,
  page,
  limit,
}: {
  orgId: string;
  page: number;
  limit: number;
}) => {
  const options = {
    page,
    limit: 10,
    sort: { createdAt: 'desc' },
    lean: true,
  };
  const result = await foldermodel.paginate({ orgId: orgId, isStarred: true }, options);

  return { status: true, response: result };
};

const listAllUnstarredFolders = async ({
  orgId,
  page,
}: {
  orgId: string;
  page: number;
}) => {
  const options = {
    page,
    limit: 10,
    sort: { createdAt: 'desc' },
    lean: true,
  };
  const result = await foldermodel.paginate({ orgId: orgId, isStarred: false }, options);
  return { status: true, response: result };
};

const updateFolder = async ({
  userId,
  folderName,
  description,
  orgId,
  folderId,
}: {
  userId: string;
  folderName?: string;
  description?: string;
  orgId: string;
  folderId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const folderExist = await foldermodel.findOne({
    _id: folderId,
    orgId: orgId,
    folderName: folderName,
  });
  if (folderExist) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `${folderName} already exist. Kindly input a different one`,
    });
  }

  const updateFields: {
    folderName?: string;
    description?: string;
  } = {};

  if (folderName !== undefined) {
    updateFields.folderName = folderName;
  }

  if (description !== undefined) {
    updateFields.description = description;
  }

  const updatedFolder = await foldermodel.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(folderId), orgId: orgId },
    { $set: { ...updateFields } },
    { new: true }
  );

  if (!updatedFolder) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  }

  return { status: true, data: updatedFolder };
};

const getAllFolders = async ({
  orgId,
  page,
  limit,
}: {
  orgId: string;
  page: number;
  limit: number;
}) => {
  const options = {
    page,
    limit,
    sort: { createdAt: 'desc' },
    lean: true,
  };

  const allFolders = await foldermodel.paginate({ orgId: orgId }, options);
  return { status: true, response: allFolders };
};

const addFolderAccess = async ({
  userId,
  folderId,
  collaboratorId,
  orgId,
}: {
  userId: string;
  folderId: string;
  collaboratorId: string;
  orgId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  const isUser = await helperServices.getUserdetailsById(collaboratorId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: collaboratorId,
    orgId: orgId,
  });

  const addAccess = await foldermodel
    .findByIdAndUpdate(
      { _id: folderId },
      { $push: { collaborators: [collaboratorId] } },
      { new: true }
    )
    .select('folderName -_id');
  if (!addAccess)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  const message = {
    status: true,
    message: `${isUser.name} Added  as collaborator  to ${addAccess.folderName} Folder`,
  };
  return message;
};

const deleteFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string | string[];
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  const session = await mongoose.startSession();
  session.startTransaction();
  const [folder, file] = await Promise.all([
    await foldermodel.updateMany(
      {
        _id: folderId,
        orgId: orgId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } },
      { new: true, session }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true, session }
    ),
  ]);

  await session.commitTransaction();
  session.endSession();

  if (!folder || !file)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });

  return { status: true, message: 'File deleted successfully' };
};

const archiveFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  const [folderArchive, _] = await Promise.all([
    await foldermodel.updateMany(
      { _id: folderId, isArchived: false },
      { isArchived: true },
      { new: true }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isArchived: false,
      },
      { isArchived: true }
    ),
  ]);

  if (!folderArchive.modifiedCount)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  return { status: true, message: 'Folder archived' };
};

const unarchiveFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string | string[];
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  console.log(folderId, 'SEE IDS');

  const [folderArchiveUpdate, _] = await Promise.all([
    await foldermodel.updateMany(
      { _id: folderId, isArchived: true },
      { isArchived: false },
      { new: true }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isArchived: true,
      },
      { isArchived: false }
    ),
  ]);

  if (!folderArchiveUpdate.modifiedCount)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });

  return { status: true, message: 'Folder unarchived' };
};

const trashFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string[];
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const isExpired = DateTime.now().plus({ days: 30 }).toJSDate();

  const [trashFolderUpdate, _] = await Promise.all([
    await foldermodel.updateMany(
      { _id: folderId, isTrashed: false },
      { isTrashed: true, isExpired: isExpired },
      { new: true }
    ),
    await filemodel.updateMany(
      { _id: folderId, isTrashed: false },
      { isTrashed: true, isExpired: isExpired },
      { new: true }
    ),
  ]);

  if (!trashFolderUpdate.modifiedCount)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });

  return { status: true, message: 'File trashed' };
};

const untrashFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string[];
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const [untrashFolderUpdate, _] = await Promise.all([
    await foldermodel.updateMany(
      { _id: folderId, isTrashed: true },
      { isTrashed: false },
      { new: true }
    ),
    await filemodel.updateMany(
      { _id: folderId, isTrashed: true },
      { isTrashed: false },
      { new: true }
    ),
  ]);

  if (!untrashFolderUpdate.modifiedCount)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });

  return { status: true, message: 'File untrashed' };
};

const cleanupFolders = async () => {
  try {
    const currentDate = new Date();

    const expiredFolders = await foldermodel.find({
      isTrashed: true,
      isExpired: { $lte: currentDate },
    });

    for (const folder of expiredFolders) {
      await foldermodel.findByIdAndDelete({ _id: folder._id });
    }

    return 'Expired folders deleted successfully';
  } catch (error) {
    console.error(error);
    throw new Error('Error cleaning up expired folders');
  }
};

const copyFolder = async ({
  copiedToFolderId,
  copiedFolderId,
  orgId,
  userId,
}: {
  copiedToFolderId: string;
  copiedFolderId: string | string[];
  orgId: string;
  userId: string;
}) => {
  let folderIds = 0;

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  if (!copiedToFolderId) {
    const folderCopy = await foldermodel.updateMany(
      { orgId: orgId },
      {
        existInHomeDirectory: true,
      }
    );
    await filemodel.updateMany(
      { orgId: orgId },
      { $set: { existInHomeDirectory: true } }
    );
    if (!folderCopy)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: errorMessages.FOLDER_NOT_FOUND,
      });
    const message = { status: true, message: `Folder copied successfully` };
    return message;
  } else {
    const filterQuery = {
      _id: copiedToFolderId,
      orgId: orgId,
    };

    const updateQuery = {
      $push: { folderId: [copiedToFolderId] },
    };
    const [folderResponse, fileResponse] = await Promise.all([
      await foldermodel.updateMany(filterQuery, updateQuery, { new: true }),
      await filemodel.updateMany(filterQuery, updateQuery, { new: true }),
    ]);
    if (
      folderResponse.modifiedCount !== folderIds ||
      fileResponse.modifiedCount !== folderIds
    )
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: errorMessages.FOLDER_NOT_FOUND,
      });
    const message = { status: true, message: `Folder copied successfully` };
    return message;
  }
};

const removeCollaboratorFolderAccess = async ({
  userId,
  folderId,
  collaboratorId,
  orgId,
}: {
  userId: string;
  folderId: string;
  collaboratorId: string;
  orgId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  const isUser = await helperServices.getUserdetailsById(collaboratorId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: collaboratorId,
    orgId: orgId,
  });

  const addAccess = await foldermodel
    .findByIdAndUpdate(
      { _id: folderId },
      { $pull: { collaborators: [collaboratorId] } },
      { new: true }
    )
    .select('foldername -_id');
  if (!addAccess)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  const message = {
    status: true,
    message: `Removed ${isUser.name} as collaborator on ${addAccess.folderName} Folder`,
  };
  return message;
};

const moveFolder = async ({
  userId,
  orgId,
  moveToFolderId,
  moveFromFolderId,
  folderId,
}: {
  userId: string;
  orgId: string;
  moveToFolderId: string;
  moveFromFolderId: string;
  folderId: string | string[];
}) => {
  let folderIds = 0;

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const searchQuery = {
    orgId: orgId,
    folderId: { $in: [folderId] },
  };

  if (Array.isArray(folderId)) {
    folderIds = folderId.length;
  }

  if (!moveToFolderId) {
    const folderMove = await foldermodel.updateMany(searchQuery, {
      $set: { existInHomeDirectory: true },
    });
    if (!folderMove)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: errorMessages.FOLDER_NOT_FOUND,
      });
    const message = { status: true, message: 'Folder moved succesfully' };
    return message;
  } else {
    if (moveToFolderId && !moveFromFolderId) {
      const [folderUpdate, fileUpdate] = await Promise.all([
        await foldermodel.updateMany(searchQuery, {
          $push: { folderId: { $in: [moveToFolderId] } },
          existInHomeDirectory: false,
        }),
        await filemodel.updateMany(searchQuery, {
          $push: { folderId: { $in: [moveToFolderId] } },
        }),
      ]);

      if (
        fileUpdate.modifiedCount !== folderIds ||
        folderUpdate.modifiedCount !== folderIds
      )
        throw new AppError({
          httpCode: httpStatus.NOT_FOUND,
          description: errorMessages.FOLDER_NOT_FOUND,
        });

      const message = { status: true, message: 'Folder moved succesfully' };
      return message;
    } else {
      const updateQuery = {
        $pull: { folderId: { $in: [moveFromFolderId] } },
        $push: { folderId: { $in: [moveToFolderId] } },
      };
      const [folderUpdate, fileUpdate] = await Promise.all([
        await foldermodel.updateMany(searchQuery, updateQuery),
        await filemodel.updateMany(searchQuery, updateQuery),
      ]);

      if (
        fileUpdate.modifiedCount !== folderIds ||
        folderUpdate.modifiedCount !== folderIds
      )
        throw new AppError({
          httpCode: httpStatus.NOT_FOUND,
          description: errorMessages.FOLDER_NOT_FOUND,
        });

      const message = { status: true, message: 'Folder moved succesfully' };
      return message;
    }
  }
};

const pinFolder = async ({ orgId, folderId }: { orgId: string; folderId: string }) => {
  const folder = await Folder.findOneAndUpdate(
    { orgId: orgId, _id: folderId, isPinned: false },
    { $set: { isPinned: true } }
  );
  if (!folder)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  return { status: true, message: 'Folder Pinned succesfuly' };
};

const unPinFolder = async ({ orgId, folderId }: { orgId: string; folderId: string }) => {
  const folder = await Folder.findByIdAndUpdate(
    { orgId: orgId, _id: folderId, isPinned: true },
    { $set: { isPinned: false } }
  );
  if (!folder)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.FOLDER_NOT_FOUND,
    });
  return { status: true, message: 'Folder unPinned succesfuly' };
};

export default {
  createFolder,
  starFolder,
  unstarFolder,
  listAllStarredFolders,
  getAllFolders,
  listAllUnstarredFolders,
  updateFolder,
  addFolderAccess,
  deleteFolder,
  archiveFolder,
  unarchiveFolder,
  untrashFolder,
  trashFolder,
  cleanupFolders,
  copyFolder,
  removeCollaboratorFolderAccess,
  moveFolder,
  pinFolder,
  unPinFolder,
};
