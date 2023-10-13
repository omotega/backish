import Organization from "../database/model/organization";
import usermodel from "../database/model/usermodel";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
import messages from "../utils/messages";
import helperServices from "./helper-services";
import mongoose from "mongoose";

const listAllUsersInOrganization = async (orgId: string) => {
  const organization = await Organization.findOne({ _id: orgId }).select(
    "invitedEmails"
  );
  if (!organization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Organization with ID ${orgId} not found`,
    });

  if (!organization.invitedEmails) {
    return [];
  }
  const result = await Promise.all(
    await organization.invitedEmails.map(async (item: any) => {
      try {
        const user = await usermodel
          .findOne({ email: item })
          .select("name -_id");
        if (user) {
          return user;
        } else {
          throw new AppError({
            httpCode: httpStatus.NOT_FOUND,
            description: "User not found",
          });
        }
      } catch (error) {
        console.error(`Error querying user with email ${item}: ${error}`);
      }
    })
  );
  if (!result.length) {
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "No users found for the provided email addresses",
    });
  }

  return result;
};

const leaveOrganization = async ({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) => {
  const isUser = await helperServices.getUserdetailsById(userId);
  const result: any = isUser.orgStatus.find(
    (item) => item.orgId?.toString() === orgId.toString()
  );
  if (!result) return;
  const index = isUser.orgStatus.indexOf(result);
  console.log(index, "this is the index");
  if (index !== -1) {
    isUser.orgStatus.splice(index, 1);
  }
  isUser.save();

  const userExistinOrg = await Organization.findOne({
    _id: orgId,
    invitedEmails: { $in: [isUser.email] },
  }).select("invitedEmails");
  if (!userExistinOrg)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  if (!userExistinOrg.invitedEmails) return;
  const results: any = userExistinOrg.invitedEmails.find(
    (item) => item === isUser.email
  );
  if (!results) return;
  const emailIndex = userExistinOrg.invitedEmails.indexOf(results);
  if (emailIndex !== -1) {
    userExistinOrg.invitedEmails.splice(emailIndex, 1);
  }
  userExistinOrg.save();
  const message = `you have left ${userExistinOrg.orgName} organization`;

  return "success";
};

export default {
  listAllUsersInOrganization,
  leaveOrganization,
};
