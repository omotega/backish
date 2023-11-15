import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import Helper from "../utils/helpers";
import config from "../config/env";
import { AppError } from "../utils/errors";
import messages from "../utils/messages";
import usermodel from "../database/model/usermodel";
import { TokenExpiredError } from "jsonwebtoken";

export const guard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.headers && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts.length === 2) {
        const scheme = parts[0];
        const credentials = parts[1];
        if (/^Bearer$/i.test(scheme)) {
          const token = credentials;
          const decode: any = Helper.decodeToken(token, config.tokenSecret);
          const user = await usermodel.findById(decode.userId);
          if (!user)
            throw new AppError({
              httpCode: httpStatus.NOT_FOUND,
              description: messages.USER_NOT_FOUND,
            });
          req.User = user;
          return next();
        }
      } else {
        return res
          .status(httpStatus.BAD_REQUEST)
          .json({ message: "Invalid authorization format" });
      }
    } else {
      return res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Authorization not found" });
    }
  } catch (error: any) {
    console.error(error.message);
    if (error instanceof TokenExpiredError)
      res
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json("Invalid bearer token. Please login.");
  }
};

export default {
  guard,
};
