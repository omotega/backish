import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { AppError } from "../utils/errors";
import Helper from "../utils/helpers";
import messages from "../utils/messages";
import organizationquery from "../database/queries/organization";
import sendEmail from "../utils/sendemail";
import membership from "../database/model/membership";
import usermodel from "../database/model/usermodel";
import helperServices from "./helper-services";
const baseUrl = "https://backisk.onrender.com";

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
    orgName: organizationName,
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
  const token = Helper.generateToken({
    userId: isUser.id,
    email: isUser.email,
  });
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
  const isUser = await helperServices.getUserdetailsById(userId);
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

const inviteUserToOrg = async ({
  orgId,
  userId,
  invitedEmail,
}: {
  orgId: string;
  userId: string;
  invitedEmail: string;
}) => {
  const getUser = await helperServices.getUserdetailsById(userId);
  const isOrganization = await organizationquery.find({
    _id: orgId,
  });
  if (!isOrganization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "organization not found",
    });
  const referenceToken = Helper.generateRef();
  const expires_at = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  const invite = await membership.create({
    email: invitedEmail,
    token: referenceToken,
    expiresAt: expires_at,
    organizationName: isOrganization.orgName,
  });
  if (!invite)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.SOMETHING_HAPPENED,
    });
  const sendUserEmail = await sendEmail({
    email: "tomoyibo@gmail.com",
    subject: `${isOrganization.orgName} organization invite`,
    message: `you are invited to join the ${isOrganization.orgName} organization on backish, this is the reference token ${invite.token}`,
  });

  return "invite sent succesful";
};



export default {
  registerUser,
  loginUser,
  updateUser,
  inviteUserToOrg,
};
