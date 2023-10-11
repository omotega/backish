import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../utils/catchasync";
import messages from "../utils/messages";
import organizatioservices from "../services/organizatioservices";

const getAllUsersInOrganization = catchAsync(
  async (req: Request, res: Response) => {
    const { orgId } = req.body;
    const response = await organizatioservices.listAllUsersInOrganization(orgId);
    res.status(httpStatus.CREATED).json({
      success: true,
      message: messages.DATA_FETCHED_SUCCESS,
      data: response,
    });
  }
);

export default { getAllUsersInOrganization };
