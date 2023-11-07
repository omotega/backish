import httpStatus from "http-status";
import foldermodel from "../database/model/folder";
import { AppError } from "../utils/errors";
import helperServices from "./helper-services";
import organization from "../database/model/organization";

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
  const checkUserPermission = await helperServices.checkUserPermission(
    userId,
    orgId
  );
  if (!checkUserPermission) return;
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
  const ifUserBelongsToOrganization =
    await helperServices.checkIfUserBelongsToOrganization({
      userId: userId,
      orgId: orgId,
    });
  if (!ifUserBelongsToOrganization) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `User doesn't belong to this organization`,
    });
  }

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
  const checkUserPermission = await helperServices.checkUserPermission(
    userId,
    orgId
  );
  if (!checkUserPermission)
    throw new AppError({
      httpCode: httpStatus.NOT_ACCEPTABLE,
      description: "you cant perfom this operation",
    });

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
      httpCode: httpStatus.NOT_ACCEPTABLE,
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
  const checkUserPermission = await helperServices.checkUserPermission(
    userId,
    orgId
  );
  if (!checkUserPermission)
    throw new AppError({
      httpCode: httpStatus.NOT_ACCEPTABLE,
      description: "you cant perfom this operation",
    });
  const ifUserBelongsToOrganization =
    await helperServices.checkIfUserBelongsToOrganization({
      userId: userId,
      orgId: orgId,
    });
  if (!ifUserBelongsToOrganization)
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: `user doesn't belong to this organization`,
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
};
