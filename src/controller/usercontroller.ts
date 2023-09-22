import userservice from "../services/userservice";
import { Request, Response } from "express";
import httpStatus from "http-status";

const signUp = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const response = await userservice.registerUser({
    name,
    email,
    password,
  });
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "User registration successful",
    data: response,
  });
};

export default {
  signUp,
};
