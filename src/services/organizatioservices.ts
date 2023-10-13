import Organization from "../database/model/organization";
import usermodel from "../database/model/usermodel";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
import messages from "../utils/messages";
import { userInfo } from "os";

const listAllUsersInOrganization = async (orgId: string) => {
  const organization = await Organization.findOne({ _id: orgId }).select(
    "invitedEmails"
  );
  if (!organization)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: "organization not found",
    });
  if (!organization.invitedEmails) return;
  const result = await Promise.all(
    await organization.invitedEmails.map(async (item: any) => {
      const user = await usermodel.findOne({ email: item }).select("name -_id");
      return user;
    })
  );
  if (!result.length)
    throw new AppError({
      httpCode: httpStatus.INTERNAL_SERVER_ERROR,
      description: messages.SOMETHING_HAPPENED,
    });
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
export default {
  listAllUsersInOrganization,
  findUser,
};
