import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { AppError } from "../utils/errors";
import messages from "../utils/messages";

async function getUserdetailsById(userId: string) {
  const user = await userquery.findUserById(userId);
  if (!user)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  return user;
}

export default {
  getUserdetailsById,
};
