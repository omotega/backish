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

const unstarFolderValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),
};

export default {
  createFolderValidation,
  unstarFolderValidation,
};
