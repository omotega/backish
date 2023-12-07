import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
const options = {
  stripUnknown: true,
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

const validate = (schemas: any, values: any) => {
  let error = [];
  for (let paramToValidate of Object.keys(schemas)) {
    const value = values[paramToValidate];
    if (value) {
      const schema = schemas[paramToValidate];
      let result = schema.validate(values[paramToValidate], options);
      if (result.error) {
        error.push(
          result.error.details.map((detail: any) => `${detail.message}`)
        );
      } else {
        values[paramToValidate] = result.value;
      }
    } else {
      error.push(`${paramToValidate} missing`);
    }
  }
  if (error.length > 0) return { error: error.flat() };
  return {};
};

const validationMiddleware = (requestSchema: any, auth = true) => {
  const schema = auth
    ? {
        ...requestSchema,
      }
    : requestSchema;
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = validate(schema, req);
    if (error) {
      throw new AppError({
        httpCode: httpStatus.BAD_REQUEST,
        description: error[0],
      });
    }
    next();
  };
};

export default validationMiddleware;
