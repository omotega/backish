import joi from 'joi';
import { validationMessages } from './custom';

const createUserValidation = {
  body: joi.object({
    name: joi.string().required().messages(validationMessages.name),
    userName: joi.string().required(),
    email: joi.string().email().required().messages(validationMessages.email),
    password: joi.string().required().messages(validationMessages.password),
    organizationName: joi
      .string()
      .required()
      .messages(validationMessages.organizationName),
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

const inviteUserValidation = {
  body: joi.object({
    email: joi.string().email().required().messages(validationMessages.email),
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const confirmInviteValidation = {
  body: joi.object({
    reference: joi.string().required().messages(validationMessages.reference),
    username: joi.string().required(),
  }),
  query: joi.object({
    orgId: joi.string().required().messages(validationMessages.orgId),
  }),
};

const recoverAccountValidation = {
  body: joi.object({
    email: joi.string().required().messages(validationMessages.email),
  }),
};

const passwordResetValidation = {
  body: joi.object({
    token: joi.string().required().messages(validationMessages.token),
    password: joi.string().required().messages(validationMessages.password),
  }),
};

export default {
  createUserValidation,
  loginUserValidation,
  updateUserValidation,
  inviteUserValidation,
  confirmInviteValidation,
  recoverAccountValidation,
  passwordResetValidation,
};
