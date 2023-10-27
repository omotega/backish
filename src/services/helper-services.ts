import httpStatus from "http-status";
import { AppError } from "../utils/errors";
import messages from "../utils/messages";
import usermodel from "../database/model/usermodel";
import organization from "../database/model/organization";
import userRoles from "../utils/role";

async function getUserdetailsById(userId: string) {
  const user = await usermodel.findOne({ _id: userId });
  if (!user)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  return user;
}

async function checkUserPermission(userId: string, orgId: any) {
  const user = await getUserdetailsById(userId);
  const response = user.orgStatus.find(
    (item) => item.orgId?.toString() === orgId.toString()
  );
  if (!response?.roleInOrg) return;
  if (
    response.roleInOrg !== userRoles.superAdmin &&
    response.roleInOrg !== userRoles.admin
  )
    throw new AppError({
      httpCode: httpStatus.NOT_ACCEPTABLE,
      description:
        "You are not authorized to carry out this operation. Contact admin for help.",
    });
  return true;
}


async function checkIfUserBelongsToOrganization({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) {
  const isUser = await getUserdetailsById(userId);
  if (!isUser) return;
  const result = isUser.orgStatus.find(
    (item) => item.orgId?.toString() === orgId
  );
  if (!result)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "User does not belong this organization",
    });
  return true;
}

export default {
  getUserdetailsById,
  checkUserPermission,
  checkIfUserBelongsToOrganization,
};
