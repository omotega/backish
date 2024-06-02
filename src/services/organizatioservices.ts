import { AppError } from '../utils/errors';
import httpStatus from 'http-status';
import messages from '../utils/messages';
import helperServices from './helper-services';
import { userRoles } from '../utils/role';
import orgMembers from '../database/model/orgMembers';
import errorMessages from '../utils/messages';

const listAllUsersInOrganization = async ({
  orgId,
  page,
}: {
  orgId: string;
  page: number;
}) => {
  const limit = 20;
  const orgUsers = await orgMembers.paginate(
    { orgId: orgId },
    {
      page,
      limit,
      populate: [
        {
          path: 'memberId',
          select: 'email name',
        },
      ],
    }
  );
  return orgUsers;
};

const findUserinOrg = async ({ orgId, userId }: { orgId: string; userId: string }) => {
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  const userDetails = await orgMembers
    .findOne({ memberId: userId, orgId: orgId })
    .populate([{ path: 'memberId', select: 'email name username' }]);
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
  await helperServices.checkIfUserBelongsToOrganization({ userId, orgId });
  await orgMembers.findOneAndUpdate(
    {
      memberId: userId,
      orgId: orgId,
    },
    { $set: { active: false } }
  );
  return { status: true, message: 'You have left the organization' };
};

const listUserOrganization = async ({
  userId,
  page,
}: {
  userId: string;
  page: number;
}) => {
  const limit = 20;
  const userOrgs = await orgMembers.paginate(
    { memberId: userId },
    {
      page,
      limit,
      populate: [
        {
          path: 'orgId',
          select: 'orgName',
        },
      ],
    }
  );
  return userOrgs;
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
  const updatedUserRole = await orgMembers
    .findOneAndUpdate(
      { memberId: collaboratorId, orgId: orgId },
      { $set: { role: userRoles.admin } }
    )
    .populate([{ path: 'memberId', select: 'name' }]);
  if (!updatedUserRole)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: errorMessages.USER_NOT_FOUND,
    });
  return { status: true, message: 'user role updated' };
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

  const deactivateUser = await orgMembers
    .findOneAndUpdate(
      { memberId: collaboratorId, orgId: orgId },
      { $set: { active: false } }
    )
    .populate([{ path: 'memberId', select: 'name' }]);

  if (!deactivateUser)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: `Could not deactivate  user from organization`,
    });
  const message = {
    status: true,
    message: `user deactivated succesfully`,
  };
  return message;
};

export default {
  listAllUsersInOrganization,
  findUserinOrg,
  leaveOrganization,
  listUserOrganization,
  updateUserRole,
  deactivateUserFromOrg,
};
