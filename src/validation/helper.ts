import joi from "joi";
import { Types } from "mongoose";
export const JoiObjectId = (value: string, helpers: joi.CustomHelpers) => {
  if (!Types.ObjectId.isValid(value)) return helpers.error("any.invalid");
  return value;
};
