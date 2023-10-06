import joi from "joi";
import { validationMessages } from "./custom";

const createUserValidation = {
  body: joi.object({
    name: joi.string().required().messages(validationMessages.name),
    email: joi.string().email().required().messages(validationMessages.email),
    password: joi.string().required().messages(validationMessages.password),
    organizationName: joi.string().required().messages(validationMessages.name),
  }),
};

const loginUserValidation = {
  body: joi.object({
    email: joi.string().email().required().messages(validationMessages.email),
    password: joi.string().required().messages(validationMessages.password),
  }),
};

const updateUserValidation = {
  body: joi.object({
    name: joi.string().required().messages(validationMessages.name),
  }),
};

export default {
  createUserValidation,
  loginUserValidation,
  updateUserValidation,
};
