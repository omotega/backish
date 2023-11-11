import joi from "joi";
import { validationMessages } from "./custom";

const getAllUserValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const getAUserValidation = {
  params: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
  query: joi.object({
    email: joi.string().email().required().messages(validationMessages.email),
  }),
};

const leaveOrgUserValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const upadateUserroleValidation = {
  body: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
    collaboratorId: joi
      .string()
      .required()
      .messages(validationMessages.collaboratorId),
  }),
};

export default {
  getAllUserValidation,
  getAUserValidation,
  leaveOrgUserValidation,
  upadateUserroleValidation,
};
