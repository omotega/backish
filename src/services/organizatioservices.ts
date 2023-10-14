import Organization from "../database/model/organization";
import usermodel from "../database/model/usermodel";
import { AppError } from "../utils/errors";
import httpStatus from "http-status";
import messages from "../utils/messages";


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
export default {
  listAllUsersInOrganization,
  findUser,
}
