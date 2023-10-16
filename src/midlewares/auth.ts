import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import Helper from "../utils/helpers";
import config from "../config/env";
import { AppError } from "../utils/errors";
import messages from "../utils/messages";
import usermodel from "../database/model/usermodel";

export const guard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (!token)
        throw new AppError({
          httpCode: httpStatus.FORBIDDEN,
          description: "please login",
        });
      const decode: any = Helper.decodeToken(token, config.tokenSecret);
      const user = await usermodel.findOne({_id: decode.payload.userId});
      if (!user)
        throw new AppError({
          httpCode: httpStatus.NOT_FOUND,
          description: messages.USER_NOT_FOUND,
        });
      req.User = user;
      return next();
    } else {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "authorization not found" });
    }
  } catch (error) {
    console.error(error);
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.SOMETHING_HAPPENED,
    });
  }
};

export default {
  guard,
}