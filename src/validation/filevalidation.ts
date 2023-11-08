import joi from "joi";
import { validationMessages } from "./custom";
import path from "path";

const directoryPath = path.join("src", "uploads");

const fileUploadValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    folderId: joi.string(),
  }),
};

export default {
  fileUploadValidation,
};
