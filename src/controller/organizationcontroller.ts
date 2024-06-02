import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchasync';
import organizatioservices from '../services/organizatioservices';

const getAllUsersInOrganization = catchAsync(async (req: Request, res: Response) => {
  const { orgId, page } = req.query as unknown as {
    orgId: string;
    page: number;
  };
  const response = await organizatioservices.listAllUsersInOrganization({ orgId, page });
  res.status(httpStatus.OK).send(response);
});

const getAUser = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId } = req.query as unknown as {
    orgId: string;
  };
  const response = await organizatioservices.findUserinOrg({
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const signOutOfOrg = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { _id } = req.User;
  const response = await organizatioservices.leaveOrganization({
    orgId: orgId,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const getAllUserOrgs = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { page } = req.query as unknown as {
    page: number;
  };
  const response = await organizatioservices.listUserOrganization({
    page,
    userId: _id,
  });
  res.status(httpStatus.OK).send(response);
});

const changeUserRole = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, collaboratorId } = req.query as unknown as {
    orgId: string;
    collaboratorId: string;
  };
  const response = await organizatioservices.updateUserRole({
    userId: _id,
    orgId: orgId,
    collaboratorId: collaboratorId,
  });
  res.status(httpStatus.OK).send(response);
});

const deactivateUserFromOrg = catchAsync(async (req: Request, res: Response) => {
  const { _id } = req.User;
  const { orgId, collaboratorId } = req.query as {
    orgId: string;
    collaboratorId: string;
  };
  const response = await organizatioservices.deactivateUserFromOrg({
    userId: _id,
    orgId: orgId,
    collaboratorId: collaboratorId,
  });
  res.status(httpStatus.OK).send(response);
});

export default {
  getAllUsersInOrganization,
  getAUser,
  signOutOfOrg,
  getAllUserOrgs,
  changeUserRole,
  deactivateUserFromOrg
};
