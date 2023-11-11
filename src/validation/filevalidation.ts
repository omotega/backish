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

export default {
  fileUploadValidation,
  addFileToFolderValidation,
};
