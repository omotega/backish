import joi from 'joi';
import { validationMessages } from './custom';
import { JoiObjectId } from './helper';
import { query } from 'express';

const getAllUserValidation = {
  query: joi.object({
    page: joi.number().required(),
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const getAUserValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const leaveOrgUserValidation = {
  params: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
  }),
};

const getAllUserOrgsValidation = {
  query: joi.object({
    page: joi.number().required(),
  }),
};

const upadateUserroleValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    collaboratorId: joi
      .custom(JoiObjectId)
      .required()
      .messages(validationMessages.collaboratorId),
  }),
};

const removeUserFromOrgValidation = {
  query: joi.object({
    orgId: joi.string().custom(JoiObjectId).required().messages(validationMessages.orgId),
    collaboratorId: joi.string().required().messages(validationMessages.collaboratorId),
  }),
};

export default {
  getAllUserValidation,
  getAUserValidation,
  leaveOrgUserValidation,
  upadateUserroleValidation,
  removeUserFromOrgValidation,
  getAllUserOrgsValidation,
};
