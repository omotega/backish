import httpStatus from 'http-status';
import foldermodel from '../database/model/folder';
import filemodel from '../database/model/file';
import { AppError } from '../utils/errors';
import helperServices from './helper-services';
import messages from '../utils/messages';
import { DateTime } from 'luxon';

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
  await helperServices.checkUserPermission(userId, orgId);
  const folderExist = await foldermodel.findOne({
    foldername: folderName,
    orgId: orgId,
  });
  if (folderExist)
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `Folder with name ${folderName} already exist`,
    });

  if (folderId) {
    const folder = await foldermodel.create({
      foldername: folderName,
      orgId: orgId,
      description: description,
      collaborators: [userId],
      $push: { folderId: [folderId] },
    });
    if (!folder)
      throw new AppError({
        httpCode: httpStatus.NOT_IMPLEMENTED,
        description: 'an error occured,could not create folder',
      });
    return folder;
  } else {
    const folder = await foldermodel.create({
      foldername: folderName,
      orgId: orgId,
      description: description,
      collaborators: [userId],
      existInHomeDirectory: true,
    });
    if (!folder)
      throw new AppError({
        httpCode: httpStatus.NOT_IMPLEMENTED,
        description: 'an error occured,could not create folder',
      });
    return folder;
  }
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
    { _id: folderId },
    { isStarred: true },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_IMPLEMENTED,
      description: 'could not star folder',
    });
  return { status: 'OK', message: 'Folder starred successfully' };
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
  const updatedDetails = await foldermodel.findByIdAndUpdate(
    { _id: folderId },
    { isStarred: false },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_IMPLEMENTED,
      description: 'could not unstar folder',
    });
  return { status: 'OK', message: 'Folder unstarred successfully' };
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
    limit,
    sort: { createdAt: 'desc' },
    lean: true,
  };
  const result = await foldermodel.paginate({ orgId: orgId, isStarred: true }, options);

  return result;
};

const listAllUnstarredFolders = async ({
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
  const result = await foldermodel.paginate({ orgId: orgId, isStarred: false }, options);
  return result;
};

const updateFolder = async ({
  userId,
  foldername,
  description,
  orgId,
  folderId,
}: {
  userId: string;
  foldername: string;
  description: string;
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
  });
  if (!folderExist) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Folder doesn't exist`,
    });
  }

  const updateFields: {
    foldername?: string;
    description?: string;
  } = {};

  if (foldername !== undefined) {
    updateFields.foldername = foldername;
  }

  if (description !== undefined) {
    updateFields.description = description;
  }

  const folderNameExist = await foldermodel.findOne({
    foldername: foldername,
  });
  if (folderNameExist) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `${foldername} already exist. Kindly input a different one`,
    });
  }

  const updatedFolder = await foldermodel.findOneAndUpdate(
    { orgId, _id: folderId },
    updateFields,
    { new: true }
  );

  if (!updatedFolder) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error occurred, could not update folder',
    });
  }

  return updatedFolder;
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
  return allFolders;
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
    .select('foldername -_id');
  if (!addAccess)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'could not add user as collaborator',
    });
  const message = {
    status: true,
    message: `Added ${isUser.name} as collaborator  to ${addAccess.foldername} Folder`,
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
  folderId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const [folder, file] = await Promise.all([
    await foldermodel.findOneAndUpdate(
      {
        _id: folderId,
        orgId: orgId,
        isDeleted: false,
      },
      { $set: { isDeleted: true } }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isDeleted: false,
      },
      { isDeleted: true }
    ),
  ]);

  if (!folder || !file)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Could not delete folder`,
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

  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const [folderArchive, fileArchive] = await Promise.all([
    await foldermodel.findOneAndUpdate(
      { _id: folderId, isarchived: false },
      { isarchived: true },
      { new: true }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isarchived: false,
      },
      { isArchived: true }
    ),
  ]);

  if (!folderArchive || !fileArchive)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error ocured, could not archive folder',
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
  folderId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const [folderArchiveUpdate, fileArchiveUpdate] = await Promise.all([
    await foldermodel.findOneAndUpdate(
      { _id: folderId, isarchived: true },
      { isarchived: true },
      { new: true }
    ),
    await filemodel.updateMany(
      {
        orgId: orgId,
        folderId: { $in: [folderId] },
        isarchived: true,
      },
      { isArchived: true }
    ),
  ]);

  if (!folderArchiveUpdate || !fileArchiveUpdate)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: 'An error ocured, could not unarchive folder',
    });

  return { status: true, message: 'File unarchived' };
};

const trashFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const isExpired = DateTime.now().plus({ days: 30 }).toJSDate();

  const trashFolderUpdate = await foldermodel.findOneAndUpdate(
    { _id: folderId, isTrashed: false },
    { isTrashed: true, isExpired: isExpired },
    { new: true }
  );
  if (!trashFolderUpdate)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'Could not trash folder',
    });

  return { status: true, message: 'File thrashed' };
};

const untrashFolder = async ({
  userId,
  orgId,
  folderId,
}: {
  userId: string;
  orgId: string;
  folderId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });

  const untrashFolderUpdate = await foldermodel.findOneAndUpdate(
    { _id: folderId, isTrashed: true },
    { isTrashed: false },
    { new: true }
  );
  if (!untrashFolderUpdate)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'Could not untrash folder',
    });

  return { status: true, message: 'File unthrashed' };
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
  if (Array.isArray(copiedFolderId)) {
    folderIds = copiedFolderId.length;
  }
  const filterQuery = {
    _id: copiedToFolderId,
    orgId: orgId,
  };
  const updateQuery = {
    $push: { folderId: [copiedToFolderId] },
  };
  if (!copiedToFolderId) {
    const folderCopy = await foldermodel.updateMany(filterQuery, {
      existInHomeDirectory: true,
    });
    if (!folderCopy)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: 'Could not copy folder',
      });
    const message = { status: true, message: `Folder copied successfully` };
    return message;
  } else {
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
        description: 'Could not copy folder',
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
      description: 'could not complete this operation',
    });
  const message = {
    status: true,
    message: `Removed ${isUser.name} as collaborator on ${addAccess.foldername} Folder`,
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
        description: messages.MOVE_FOLDER_ERROR,
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
          description: messages.MOVE_FOLDER_ERROR,
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
          description: messages.MOVE_FOLDER_ERROR,
        });

      const message = { status: true, message: 'Folder moved succesfully' };
      return message;
    }
  }
};

// pin folder and pin file

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
};
