import joi from "joi";
import { validationMessages } from "./custom";
import { JoiObjectId } from "./helper";

const createFolderValidation = {
  body: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    foldername: joi.string().required().messages(validationMessages.foldername),
    description: joi
      .string()
      .required()
      .messages(validationMessages.description),
  }),
};

const starFolderValidation = {
  body: joi.object({
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
  body: joi.object({
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

const listUnstarredFoldersValidation = {
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
};
