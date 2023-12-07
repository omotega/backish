import httpStatus from "http-status";
import foldermodel from "../database/model/folder";
import filemodel from "../database/model/file";
import { AppError } from "../utils/errors";
import helperServices from "./helper-services";
import organization from "../database/model/organization";
import messages from "../utils/messages";
import mongoose from "mongoose";

const createFolder = async ({
  userId,
  folderName,
  orgId,
  description,
}: {
  userId: string;
  folderName: string;
  orgId: string;
  description: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  const orgExist = await organization.findOne({ _id: orgId });
  if (!orgExist)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Organization  not found`,
    });
  const folderExist = await foldermodel.findOne({
    foldername: folderName,
    orgId: orgId,
  });
  if (folderExist)
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `Folder with name ${folderName} already exist`,
    });

  const folder = await foldermodel.create({
    foldername: folderName,
    orgId: orgExist._id,
    description: description,
    collaborators: [userId],
  });

  if (!folder)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "an error occured,could not create folder",
    });
  return folder;
};

const starFolder = async ({
  orgId,
  folderId,
}: {
  orgId: string;
  folderId: string;
}) => {
  const folder = await foldermodel.findOne({
    orgId: orgId,
    _id: folderId,
    isStarred: false,
  });
  if (!folder)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });

  const updatedDetails = await foldermodel.findByIdAndUpdate(
    { _id: folder._id },
    { isStarred: true },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "could not star folder",
    });
  return updatedDetails;
};

const unstarFolder = async ({
  orgId,
  folderId,
}: {
  orgId: string;
  folderId: string;
}) => {
  const folder = await foldermodel.findOne({
    orgId: orgId,
    _id: folderId,
    isStarred: true,
  });
  if (!folder)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });

  const updatedDetails = await foldermodel.findByIdAndUpdate(
    { _id: folder._id },
    { isStarred: false },
    { new: true }
  );
  if (!updatedDetails)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "could not unstar folder",
    });
  return updatedDetails;
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
    sort: { createdAt: "desc" },
    lean: true,
  };
  const result = await foldermodel.paginate(
    { orgId: orgId, isStarred: true },
    options
  );
  if (!result)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });
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
    sort: { createdAt: "desc" },
    lean: true,
  };
  const result = await foldermodel.paginate(
    { orgId: orgId, isStarred: false },
    options
  );
  if (!result)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });
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
      description: "An error occurred, could not update folder",
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
    sort: { createdAt: "desc" },
    lean: true,
  };

  const allFolders = await foldermodel.paginate({ orgId: orgId }, options);
  if (!allFolders)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });

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
    .select("foldername -_id");
  if (!addAccess)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "could not complete this operation",
    });
  const message = `Added ${isUser.name} as collaborator  to ${addAccess.foldername} Folder`;
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
  const folderExist = await foldermodel.findOne({
    _id: folderId,
    orgId: orgId,
  });
  if (!folderExist)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Folder doesn't exist`,
    });

  const folder = await foldermodel.findOneAndDelete({
    _id: folderId,
  });

  return folder;
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

  const folderArchive = await foldermodel.findOneAndUpdate(
    { _id: folderId, isarchived: false },
    { isarchived: true },
    { new: true }
  );
  if (!archiveFolder)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error ocured, could not archive folder",
    });
  return folderArchive;
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

  const folderArchiveUpdate = await foldermodel.findOneAndUpdate(
    { _id: folderId, isarchived: true },
    { isarchived: false },
    { new: true }
  );
  if (!archiveFolder)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error ocured, could not unarchive folder",
    });
  return folderArchiveUpdate;
};

const copyFolder = async ({
  copiedToFolderId,
  copiedFolderId,
  orgId,
  userId,
}: {
  copiedToFolderId: string;
  copiedFolderId: string;
  orgId: string;
  userId: string;
}) => {
  await helperServices.checkIfUserBelongsToOrganization({
    userId: userId,
    orgId: orgId,
  });
  const [folderExist, isFolderExist] = await Promise.all([
    await foldermodel.findOne({
      _id: copiedToFolderId,
      orgId: orgId,
    }),
    await foldermodel.findOne({
      _id: copiedFolderId,
      orgId: orgId,
    }),
  ]);
  if (!folderExist || !isFolderExist)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "folder not found",
    });

  const session = await mongoose.startSession();
  session.startTransaction();
  const folderResponse = await foldermodel.findOneAndUpdate(
    {
      _id: copiedToFolderId,
      orgId: orgId,
    },
    { $push: { folderId: [copiedFolderId] } },
    { new: true, session }
  );
  const fileResponse = await filemodel.findOneAndUpdate(
    { folderId: { $in: [copiedFolderId] } },
    { $push: { folderId: [copiedToFolderId] } },
    { new: true, session }
  );

  await session.commitTransaction();
  session.endSession();
  if (!folderResponse)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "An error occured, could not copy folder",
    });
  const message = `Folder copied successfully`;
  return message;
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
  copyFolder,
};
