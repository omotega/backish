import httpStatus from "http-status";
import userquery from "../database/queries/userquery";
import { AppError } from "../utils/errors";
import messages from "../utils/messages";
import usermodel from "../database/model/usermodel";

async function getUserdetailsById(userId: string) {
  const user = await usermodel.findOne({_id: userId});
  if (!user)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: messages.USER_NOT_FOUND,
    });
  return user;
}



async function checkUserPermission(
  userId: string,
  orgId: any
) {
  const user = await getUserdetailsById(userId);
  user.orgStatus.map((item) => {
    if (item.orgId === undefined || item.roleInOrg === undefined) return;
    if ((item.orgId !== orgId && item.roleInOrg !== "super-admin")) {
      throw new AppError({
        httpCode: httpStatus.NOT_ACCEPTABLE,
        description:
          "you are not allow to invite people to the organization,contact the admins if you wish to do so",
      });
    }
  });
  return true;
}

export default {
  getUserdetailsById,
  checkUserPermission,
};
