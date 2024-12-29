import userservice from '../services/userservice';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchasync';

const signUp = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, organizationName, userName } = req.body;
  const response = await userservice.registerUser({
    name,
    email,
    password,
    organizationName,
    userName,
  });
  res.status(httpStatus.CREATED).send(response);
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = await userservice.loginUser({
    email,
    password,
  });
  res.status(httpStatus.OK).send(response);
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { name } = req.body;

  const response = await userservice.updateUser({ userId: _id, name: name });

  res.status(httpStatus.OK).send(response);
});

const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { email, orgId } = req.body;

  const response = await userservice.inviteUserToOrg({
    userId: _id,
    orgId: orgId,
    invitedEmail: email,
  });

  res.status(httpStatus.OK).send(response);
});

const confirmInvite = catchAsync(async (req: Request, res: Response) => {
  const { reference, username } = req.body;
  const { orgId } = req.query as unknown as {
    orgId: string;
  };
  const response = await userservice.confirmUserInvite({
    reference,
    username,
    orgId,
  });
  res.status(httpStatus.OK).send(response);
});

const recover = catchAsync(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const response = await userservice.recoverAccount(req, res, email);
    res.status(httpStatus.OK).send(response);
  } catch (error) {
    console.error(error);
  }
});

const passwordReset = catchAsync(async (req: Request, res: Response) => {
  const { confirmPassword, password, token } = req.body;

  const response = await userservice.reset({
    token,
    password,
    confirmPassword,
  });
  res.status(httpStatus.OK).send(response);
});

export default {
  signUp,
  login,
  updateUser,
  inviteUser,
  confirmInvite,
  recover,
  passwordReset,
};
