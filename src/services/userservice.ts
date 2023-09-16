import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { Iuser } from "../types/user";
import { AppError } from "../utils/errors";
import Helper from "../utils/helpers";

const registerUser = async (input: Iuser) => {
  const isUser = await userquery.findUserByEmail(input.name);
  if (isUser)
    throw new AppError({
      httpCode: httpStatus.FOUND,
      description: "User already exist",
    });
  const hash = await Helper.hashPassword(input.password);
  const user = await userquery.createUser({
    name: input.name,
    email: input.email,
    password: hash,
  });
  if (!user)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "error creating user",
    });
  return user;
};

export default {
  registerUser
}
