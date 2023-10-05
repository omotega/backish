import joi from "joi";
import { validationMessages } from "./custom";

const uploadRequest = {
  body: joi.object({
    filename: joi.string().required().messages(validationMessages.filename),
  }),
};

export default {
  uploadRequest,
};
