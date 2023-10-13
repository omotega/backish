import joi from "joi";
import { validationMessages } from "./custom";

const getAllUserValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};
const getAUserValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    email: joi.string().email().required().messages(validationMessages.email),
  }),
};

export default {
  getAllUserValidation,
  getAUserValidation,
};
