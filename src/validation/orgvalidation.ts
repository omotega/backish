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
  })
};


const leaveOrgUserValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

export default {
  getAllUserValidation,
  getAUserValidation,
  leaveOrgUserValidation,
};
