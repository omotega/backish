import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { AppError } from "../utils/errors";
import Helper from "../utils/helpers";
import messages from "../utils/messages";
import organizationquery from "../database/queries/organization";

const registerUser = async ({
  name,
  email,
  password,
  organizationName,
}: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}) => {
  const isUser = await userquery.findUserByEmail(email);
  if (isUser)
    throw new AppError({
      httpCode: httpStatus.FOUND,
      description: messages.USER_ALREADY_EXIST,
    });
  const hash = await Helper.hashPassword(password);
  const organization = await organizationquery.createOrganization({
    name: organizationName,
  });
  if (!organization)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.SOMETHING_HAPPENED,
    });
  const user = await userquery.createUser({
    orgId: organization.id,
    name: name,
    email: email,
    password: hash,
  });
  if (!user)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.USER_CREATION_ERROR,
    });
  return user;
};

const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const isUser = await userquery.findUserByEmail(email);
  if (!isUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_LOGIN_ERROR,
    });
  const isPassword = await Helper.comparePassword(isUser.password, password);
  if (!isPassword)
    throw new AppError({
      httpCode: httpStatus.BAD_REQUEST,
      description: messages.INCORRECT_PASSWORD,
    });
  const token = Helper.generateToken({ userId: isUser.id, email: isUser.email });
  const result = { isUser, token };
  return result;
};

const updateUser = async ({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) => {
  const isUser = await userquery.findUserById(userId);
  if (!isUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  const updateUser = await userquery.updateUserDetails({
    userId: isUser.id,
    name: name,
  });
  if (!updateUser)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.USER_UPDATE_ERROR,
    });
  return updateUser;
};

export default {
  registerUser,
  loginUser,
  updateUser,
};
