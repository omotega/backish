import joi from "joi";
import { validationMessages } from "./custom";
import { JoiObjectId } from "./helper";

const fileUploadValidation = {
  body: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .messages(validationMessages.folderId),
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
  }),
};

const moveFileValidation = {
  body: joi.object({
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const getAllFilesInFolderValidation = {
  params: joi.object({
    folderId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  query: joi.object({
    page: joi.number().required(),
  }),
};

export default {
  fileUploadValidation,
  addFileToFolderValidation,
  getAllFilesInFolderValidation,
  moveFileValidation,
};
