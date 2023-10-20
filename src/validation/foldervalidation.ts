import joi from "joi";
import { validationMessages } from "./custom";

const createFolderValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    foldername: joi.string().required().messages(validationMessages.foldername),
    description: joi
      .string()
      .required()
      .messages(validationMessages.description),
  }),
};

const starFolderValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),
};

const unstarFolderValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),
};

const liststarredFoldersValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};


const listUnstarredFoldersValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
  }),

}
const renameFolderValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    foldername: joi.string().required().messages(validationMessages.foldername),
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),

};

const listAllFoldersValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  query: joi.object({
    page: joi.number().required(),
    limit: joi.number().required(),
  }),
};



export default {
  createFolderValidation,
  starFolderValidation,
  unstarFolderValidation,
  liststarredFoldersValidation,
  listAllFoldersValidation,
  listUnstarredFoldersValidation,
  renameFolderValidation,
};
