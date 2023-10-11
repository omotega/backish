import joi from "joi";
import { validationMessages } from "./custom";

const getAllUserValidation = {
    body: joi.object({
      orgId: joi.string().required().messages(validationMessages.orgId),
    }),
  };

export default {
    getAllUserValidation
}