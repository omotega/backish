import joi from "joi";
import { validationMessages } from "./custom";

const fileUploadValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi.string(),
  }),
};

const addFileToFolderValidation = {
  body: joi.object({
    folderId: joi.string().messages(validationMessages.folderId),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

export default {
  fileUploadValidation,
  addFileToFolderValidation,
};
