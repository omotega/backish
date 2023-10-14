import httpStatus from "http-status";
import foldermodel from "../database/model/folder";
import { AppError } from "../utils/errors";
import helperServices from "./helper-services";
import { StringExpressionOperatorReturningBoolean } from "mongoose";

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
  if(!checkUserPermission) return
  const folder = await foldermodel.create({
    foldername: folderName,
    orgId: orgId,
    description: description,
  });

  if (!folder)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "an error occured,could not create folder",
    });
  return folder;
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

export default {
  createFolder,
  unstarFolder
};
