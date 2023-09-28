import userservice from "../services/userservice";
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchasync";
import messages from "../utils/messages";

const signUp = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const response = await userservice.registerUser({
    name,
    email,
    password,
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

export default {
  signUp,
  login,
};
