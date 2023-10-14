import userservice from "../services/userservice";
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchasync";
import messages from "../utils/messages";

const signUp = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, organizationName } = req.body;
  const response = await userservice.registerUser({
    name,
    email,
    password,
    organizationName,
  });
  res.status(httpStatus.CREATED).json({
    success: true,
    message: messages.SIGN_UP_SUCCESS,
    data: response,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = await userservice.loginUser({
    email,
    password,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: messages.LOGIN_SUCCESS,
    data: response,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { name } = req.body;

  const response = await userservice.updateUser({ userId: _id, name: name });

  res.status(httpStatus.OK).json({
    success: true,
    message: messages.USER_UPDATE_SUCCESFUL,
    data: response,
  });
});

const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { email, orgId } = req.body;

  await userservice.inviteUserToOrg({
    userId: _id,
    orgId: orgId,
    invitedEmail: email,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: messages.ORG_INVITATION_SUCCESS,
  });
});

const confirmInvite = catchAsync(async (req: Request, res: Response) => {
  const { reference } = req.body;
  const response = await userservice.confirmUserInvite(reference);
  res.status(httpStatus.OK).json({
    success: true,
    message: response,
  });
});
export default {
  signUp,
  login,
  updateUser,
  inviteUser,
  confirmInvite,
};
