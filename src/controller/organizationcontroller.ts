import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchasync";
import messages from "../utils/messages";
import organizatioservices from "../services/organizatioservices";

const getAllUsersInOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const { orgId } = req.body;
    const response = await organizatioservices.listAllUsersInOrganization(
      orgId
    );
    res.status(httpStatus.OK).json({
      success: true,
      message: messages.DATA_FETCHED_SUCCESS,
      data: response,
    });
  }
);

const getAUser = catchAsync(async (req: Request, res: Response) => {
  const { orgId, email } = req.body;
  const response = await organizatioservices.findUser({
    orgId: orgId,
    email: email,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: messages.DATA_FETCHED_SUCCESS,
    data: response,
  });
});

const signOutOfOrg = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = req.body;
  const { _id } = req.User;
  const response = await organizatioservices.leaveOrganization({
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: response,
  });
});

const getAllUserOrgs = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const response = await organizatioservices.listUserOrganization({
    userId: _id,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: response,
  });
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, collaboratorId } = req.body;
  const response = await organizatioservices.updateUserRole({
    userId: _id,
    orgId: orgId,
    collaboratorId: collaboratorId,
  });
  res.status(httpStatus.OK).json({
    success: true,
    message: "Role updates succesfully",
    data: response,
  });
});

export default {
  getAllUsersInOrganization,
  getAUser,
  signOutOfOrg,
  getAllUserOrgs,
  changeUserRole
};
