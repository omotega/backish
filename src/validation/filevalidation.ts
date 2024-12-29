import joi from 'joi';
import { validationMessages } from './custom';
import { JoiObjectId } from './helper';

const fileUploadValidation = {
  body: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    folderId: joi.string().custom(JoiObjectId).messages(validationMessages.folderId),
  }),
};

const addFileToFolderValidation = {
  body: joi.object({
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};

const moveFileValidation = {
  body: joi.object({
    folderId: joi.string().custom(JoiObjectId).messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const getAllFilesInFolderValidation = {
  query: joi.object({
    page: joi.number().required(),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const getAllFilesValidation = {
  query: joi.object({
    page: joi.number().required(),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const starFileValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};

const unstarFileValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};

const archiveValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  params: joi.object({
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};

const trashValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  params: joi.object({
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};
const fileCopyValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    fileId: joi
      .array()
      .items(
        joi.string().custom(JoiObjectId).required().messages(validationMessages.fileId)
      )
      .single(),
    folderId: joi.string().custom(JoiObjectId).messages(validationMessages.folderId),
  }),
};

const updateFilenameValidation = {
  params: joi.object({
    fileId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.fileId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  body: joi.object({
    fileName: joi.string().required().messages(validationMessages.filename),
  }),
};

const getTrashedFilesValidation = {
  query: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    page: joi.number().required(),
  }),
};

const lockFileValidation = {
  query: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    fileId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.fileId),
  }),
  body: {
    password: joi.string().required().messages(validationMessages.password),
  },
};

const resetFilePasswordValidation = {
  query: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    fileId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.fileId),
  }),
  body: {
    newPassword: joi.string().required().messages(validationMessages.password),
    oldPassword: joi.string().required().messages(validationMessages.password),
  },
};

const sortFilePasswordValidation = {
  query: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    sortType: joi.string().required(),
  }),
};

export default {
  fileUploadValidation,
  addFileToFolderValidation,
  getAllFilesInFolderValidation,
  moveFileValidation,
  getAllFilesValidation,
  starFileValidation,
  unstarFileValidation,
  archiveValidation,
  trashValidation,
  fileCopyValidation,
  updateFilenameValidation,
  getTrashedFilesValidation,
  lockFileValidation,
  resetFilePasswordValidation,
  sortFilePasswordValidation,
};
