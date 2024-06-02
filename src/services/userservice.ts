import httpStatus from 'http-status';
import { AppError } from '../utils/errors';
import Helper from '../utils/helpers';
import messages from '../utils/messages';
import sendEmail from '../utils/email';
import membership from '../database/model/membership';
import usermodel from '../database/model/usermodel';
import helperServices from './helper-services';
import Organization from '../database/model/organization';
import mongoose from 'mongoose';
import otpmodel from '../database/model/otpmodel';
import { Request, Response } from 'express';
import organization from '../database/model/organization';
import orgMembers from '../database/model/orgMembers';
import { userRoles } from '../utils/role';
import { valid } from 'joi';

const registerUser = async ({
  name,
  email,
  password,
  organizationName,
  userName,
}: {
  name: string;
  email: string;
  password: string;
  organizationName: string;
  userName: string;
}) => {
  const isUser = await usermodel.findOne({ email: email });
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
      description: 'Organization with this name already exist',
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
        name: name,
        email: email,
        password: hash,
      },
    ],
    { session }
  );
  const userId = user.map((item) => item._id);
  await orgMembers.create(
    [{ orgId: orgId, memberId: userId, userName: userName, role: userRoles.superAdmin }],
    {
      session,
    }
  );
  await session.commitTransaction();
  session.endSession();
  if (!user || !organization)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.USER_CREATION_ERROR,
    });
  return { status: true, meassage: user };
};

const loginUser = async ({ email, password }: { email: string; password: string }) => {
  const isUser = await usermodel.findOne({ email: email });
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

const updateUser = async ({ userId, name }: { userId: string; name: string }) => {
  const isUser = await helperServices.getUserdetailsById(userId);
  const updateUser = await usermodel.findByIdAndUpdate(
    {
      userId: isUser._id,
    },
    { $set: { name: name } },
    { new: true }
  );
  if (!updateUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_UPDATE_ERROR,
    });
  return { status: true, messages: 'User details updated succesfully' };
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
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  const isOrganization = await organization.findOne({
    _id: orgId,
  });
  if (!isOrganization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'organization not found',
    });
  await helperServices.getUserdetailsById(userId);
  const referenceToken: any = Helper.generateRef();
  const expires_at = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
  const inviteData = {
    token: referenceToken,
    userId: userId,
    orgId: orgId,
    expiresAt: expires_at,
    email: invitedEmail,
  };
  await membership.create({ ...inviteData });
  await sendEmail({
    toEmail: invitedEmail,
    subject: `${isOrganization.orgName} organization invite`,
    message: `you are invited to join the ${isOrganization.orgName} organization on backish, this is the reference token ${inviteData.token}`,
  });
  return { status: true, message: 'invite sent succesful' };
};

const confirmUserInvite = async ({
  reference,
  username,
  userId,
  orgId,
}: {
  reference: string;
  userId: string;
  username: string;
  orgId: string;
}) => {
  const data = await membership.findOne({
    userId: userId,
    token: reference,
    valid: true,
  });
  if (!data)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'invite not found',
    });
  await orgMembers.create({ orgId: orgId, memberId: userId, userName: username });
  await membership.deleteMany({ userId: userId, orgId: orgId });
  return { status: true };
};


const recoverAccount = async (req: Request, res: Response, reqEmail: string) => {
  const { email } = req.body;

  const isUser = await usermodel.findOne({ email: reqEmail });

  if (!isUser) {
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  }

  const otp = Helper.generateOtp();
  await otpmodel.findOneAndUpdate({ email: email }, { token: otp, expired: false });

  const subject: string = 'Reset password otp';
  const message = `Hi, Kindly use this ${otp} to reset your password`;

  await sendEmail({
    toEmail: email,
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
