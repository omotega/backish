import joi from "joi";
import { validationMessages } from "./custom";
import { JoiObjectId } from "./helper";

const createFolderValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi.string().custom(JoiObjectId),
  }),
  body: joi.object({
    foldername: joi.string().required().messages(validationMessages.foldername),
    description: joi
      .string()
      .required()
      .messages(validationMessages.description),
  }),
};

const starFolderValidation = {
  query: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const unstarFolderValidation = {
  query: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const liststarredFoldersValidation = {
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
  }),
};

const listUnstarredFoldersValidation = {
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
  }),
};

const updateFolderValidation = {
  body: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    foldername: joi.string().messages(validationMessages.foldername),
    description: joi.string().messages(validationMessages.description),
  }),
};

const listAllFoldersValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
  }),
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};

const folderAccessValidation = {
  body: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    collaboratorId: joi
      .string()
      .required()
      .messages(validationMessages.collaboratorId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const folderArchiveValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const folderUnarchiveValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const trashValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  params: joi.object({
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),
};

const folderCopyValidation = {
  body: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    copiedFolderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
    copiedToFolderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const removeFolderAccessValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    collaboratorId: joi
      .string()
      .required()
      .messages(validationMessages.collaboratorId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const moveFolderAccessValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    moveToFolderId: joi.string().messages(validationMessages.folderId),
    moveFromFolderId: joi.string().messages(validationMessages.folderId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

export default {
  createFolderValidation,
  starFolderValidation,
  unstarFolderValidation,
  liststarredFoldersValidation,
  listAllFoldersValidation,
  listUnstarredFoldersValidation,
  updateFolderValidation,
  folderAccessValidation,
  folderArchiveValidation,
  folderUnarchiveValidation,
  folderCopyValidation,
  trashValidation,
  removeFolderAccessValidation,
  moveFolderAccessValidation,
};
