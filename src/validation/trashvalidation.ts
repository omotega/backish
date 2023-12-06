import joi from "joi";
import { validationMessages } from "./custom";
import { JoiObjectId } from "./helper";

const moveFolderToTrashValidation = {
  params: joi.object({
    orgId: joi
      .string()
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.orgId),
    folderId: joi.string().required().messages(validationMessages.folderId),
  }),
};

const moveFileToTrashValidation = {
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
    fileId: joi.string().required().messages(validationMessages.fileId),
  }),
};

const restoreTrashValidation = {
  params: joi.object({
    trashId: joi.string().required().messages(validationMessages.trashId),
  }),
};

export default {
  moveFolderToTrashValidation,
  moveFileToTrashValidation,
  restoreTrashValidation,
};
