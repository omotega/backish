import joi from "joi";
import { Types } from "mongoose";
export const JoiObjectId = () =>
  joi.string().custom((value: string, helpers) => {
    if (!Types.ObjectId.isValid(value)) return helpers.error("any.invalid");
    return value;
  }, "Object Id Validation");
