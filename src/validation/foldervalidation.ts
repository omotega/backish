import joi from 'joi';
import { validationMessages } from './custom';
import { JoiObjectId } from './helper';

const createFolderValidation = {
  params: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi.string().custom(JoiObjectId),
  }),
  body: joi.object({
    foldername: joi.string().required().messages(validationMessages.foldername),
    description: joi.string().required().messages(validationMessages.description),
  }),
  query: joi.object({
    folderId: joi.string().custom(JoiObjectId),
  }),
};

const starFolderValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const unstarFolderValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
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
    limit: joi.number(),
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const listUnstarredFoldersValidation = {
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number(),
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const updateFolderValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderName: joi.string().messages(validationMessages.foldername),
    description: joi.string().messages(validationMessages.description),
  }),
  params: joi.object({
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const listAllFoldersValidation = {
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number(),
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const folderAccessValidation = {
  params: joi.object({
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    collaboratorId: joi.string().required().messages(validationMessages.collaboratorId),
  }),
};

const folderArchiveValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi
      .array()
      .items(
        joi.string().custom(JoiObjectId).required().messages(validationMessages.folderId)
      ),
  }),
};

const folderUnarchiveValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi
      .array()
      .items(
        joi.string().custom(JoiObjectId).required().messages(validationMessages.folderId)
      ),
  }),
};

const trashFolderValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi
      .array()
      .items(
        joi.string().custom(JoiObjectId).required().messages(validationMessages.folderId)
      ),
  }),
};

const unTrashFolderValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi
      .array()
      .items(
        joi.string().custom(JoiObjectId).required().messages(validationMessages.folderId)
      ),
  }),
};

const folderCopyValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
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
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    collaboratorId: joi.string().required().messages(validationMessages.collaboratorId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const moveFolderAccessValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    moveToFolderId: joi.string().messages(validationMessages.folderId),
    moveFromFolderId: joi.string().messages(validationMessages.folderId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const pinFolderValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
  }),
};

const unpinFolderValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
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
  trashFolderValidation,
  removeFolderAccessValidation,
  moveFolderAccessValidation,
  unTrashFolderValidation,
  pinFolderValidation,
  unpinFolderValidation,
};
