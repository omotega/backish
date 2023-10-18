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
import Organization from "../database/model/organization";
import mongoose from "mongoose";
import otpmodel from "../database/model/otpmodel";
import { Request, Response } from "express";

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
      httpCode: httpStatus.CONFLICT,
      description: messages.USER_ALREADY_EXIST,
    });
  const hash = await Helper.hashPassword(password);
  const orgNameExist = await Organization.findOne({
    orgName: organizationName,
  });
  if (orgNameExist)
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: "Organization with this name already exist",
    });
  const session = await mongoose.startSession();
  session.startTransaction();
  const organization = await Organization.create(
    [
      {
        orgName: organizationName,
      },
    ],
    { session }
  );
  const orgId = organization.map((item) => item._id);
  const user = await usermodel.create(
    [
      {
        orgStatus: [
          {
            orgId: orgId,
            roleInOrg: "super-admin",
          },
        ],
        name: name,
        email: email,
        password: hash,
      },
    ],
    { session }
  );
  await session.commitTransaction();
  session.endSession();
  if (!user || !organization)
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
    userId: isUser._id,
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
    userId: isUser._id,
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
  const isOrganization = await organizationquery.find({
    _id: orgId,
  });
  if (!isOrganization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "organization not found",
    });
  await helperServices.getUserdetailsById(userId);
  await helperServices.checkUserPermission(userId, isOrganization._id);
  const referenceToken: any = Helper.generateRef();
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
  await sendEmail({
    email: invitedEmail,
    subject: `${isOrganization.orgName} organization invite`,
    message: `you are invited to join the ${isOrganization.orgName} organization on backish, this is the reference token ${invite.token}`,
  });

  return "invite sent succesful";
};

const confirmUserInvite = async (reference: string) => {
  const ismember = await membership.findOne({ token: reference });
  if (!ismember)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "invite not found",
    });
  const userHasAccount = await userquery.findUserByEmail(
    ismember.email as string
  );
  if (!userHasAccount)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description:
        "You do not have an account. Please signup before you can confirm invite.",
    });
  const isOrganization = await organizationquery.find({
    orgName: ismember.orgName,
  });
  if (!isOrganization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "Organization not found",
    });
  const updateQuery = {
    $push: { invitedEmails: userHasAccount.email },
  };

  const userUpdateQuery = {
    $push: {
      orgStatus: [
        {
          orgId: isOrganization._id,
          roleInOrg: "guest",
        },
      ],
    },
  };
  const response = await Promise.all([
    await Organization.findByIdAndUpdate(
      { _id: isOrganization._id },
      updateQuery
    ),
    await usermodel.findByIdAndUpdate(
      { _id: userHasAccount._id },
      userUpdateQuery
    ),
    await ismember.deleteOne({ id: ismember.id, token: ismember.token }),
  ]);
  if (!response.length)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.SOMETHING_HAPPENED,
    });
  const message = `you have succesfully joined ${isOrganization.orgName} organization`;
  return message;
};

const recoverAccount = async (
  req: Request,
  res: Response,
  reqEmail: string
) => {
  const { email } = req.body;

  const isUser = await usermodel.findOne({ email: reqEmail });

  if (!isUser) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  }

  const otp = Helper.generateOtp();
  await otpmodel.findOneAndUpdate(
    { email: email },
    { token: otp, expired: false }
  );

  const subject: string = "Reset password otp";
  const message = `Hi, Kindly use this ${otp} to reset your password`;

  await sendEmail({
    email: email,
    subject: subject,
    message: message,
  });
};

const reset = async ({
  token,
  password,
  confirmPassword,
}: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  const otp = await otpmodel.findOneAndUpdate({ token, expired: true });
  if (!otp)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.OTP_NOT_FOUND,
    });

  if (password !== confirmPassword) {
    throw new AppError({
      httpCode: httpStatus.CONFLICT,
      description: messages.PASSWORD_MISMATCH,
    });
  }

  const hash = await Helper.hashPassword(password);
  await usermodel.findOneAndUpdate(
    {
      email: otp.email,
    },
    { password: hash },
    { new: true }
  );
};

export default {
  registerUser,
  loginUser,
  updateUser,
  inviteUserToOrg,
  confirmUserInvite,
  recoverAccount,
  reset,
};
