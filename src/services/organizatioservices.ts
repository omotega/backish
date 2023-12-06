import Organization from "../database/model/organization";
import usermodel from "../database/model/usermodel";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
import messages from "../utils/messages";
import helperServices from "./helper-services";
import organization from "../database/model/organization";
import userRoles from "../utils/role";
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

const findUser = async ({ orgId, email }: { orgId: string; email: string }) => {
  const userExistinOrg = await Organization.findOne({
    _id: orgId,
    invitedEmails: { $in: [email] },
  });
  if (!userExistinOrg)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  const userDetails = await usermodel
    .findOne({ email: email })
    .select("name -_id");
  if (!userDetails)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  return userDetails;
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

  return message;
};

const listUserOrganization = async ({ userId }: { userId: string }) => {
  const isUser = await helperServices.getUserdetailsById(userId);
  if (!isUser) return;
  const result = await Promise.all(
    await isUser.orgStatus.map(async (item: any) => {
      const orgs = await organization
        .findOne({ _id: item.orgId })
        .select("orgName -_id");
      return orgs;
    })
  );

  if (!result) return;
  return result;
};

const updateUserRole = async ({
  userId,
  orgId,
  collaboratorId,
}: {
  userId: string;
  orgId: string;
  collaboratorId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: collaboratorId,
    orgId: orgId,
  });

  const updateRole = await usermodel.findOneAndUpdate(
    {
      _id: collaboratorId,
      "orgStatus.roleInOrg": userRoles.guest,
      "orgStatus.orgId": orgId,
    },
    {
      $set: {
        "orgStatus.$.roleInOrg": userRoles.admin,
      },
    },
    { new: true }
  );
  if (!updateRole)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: "Could not upadate role",
    });
  const message = `${updateRole.name} is now an Admin `;

  return message;
};

const deactivateUserFromOrg = async ({
  userId,
  orgId,
  collaboratorId,
}: {
  userId: string;
  orgId: string;
  collaboratorId: string;
}) => {
  await helperServices.checkUserPermission(userId, orgId);
  await helperServices.checkIfUserBelongsToOrganization({
    userId: collaboratorId,
    orgId: orgId,
  });
  const isUser = await usermodel
    .findOne({ _id: collaboratorId })
    .select("_id name email");

  if (!isUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  const [org, user] = await Promise.all([
    await organization.findOneAndUpdate(
      { invitedEmails: { $in: [isUser.email] } },
      { $pull: { invitedEmails: { $in: [isUser.email] } } },
      { new: true }
    ),
    await usermodel.findOneAndUpdate(
      { orgStatus: { $elemMatch: { orgId: orgId } } },
      { $pull: { orgStatus: { $elemMatch: { orgId: orgId } } } }
    ),
  ]);
  if (!org || !user)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: `Could not remove ${isUser.name} from organization`,
    });
  const message = `${isUser.name} removed succesfully`;
  return message;
};

export default {
  listAllUsersInOrganization,
  findUser,
  leaveOrganization,
  listUserOrganization,
  updateUserRole,
  deactivateUserFromOrg
};
