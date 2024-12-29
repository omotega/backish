import httpStatus from 'http-status';
import { AppError } from '../utils/errors';
import messages from '../utils/messages';
import usermodel from '../database/model/usermodel';
import fileModel from '../database/model/file';
import { userRoles } from '../utils/role';
import orgMembers from '../database/model/orgMembers';

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
  const response = await orgMembers.findOne({
    memberId: userId,
    orgId: orgId,
    role: userRoles.admin,
  });
  if (!response)
    throw new AppError({
      httpCode: httpStatus.NOT_ACCEPTABLE,
      description: 'You are not authorized to carry out this operation.',
    });
}

async function checkIfUserBelongsToOrganization({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) {
  const result = await orgMembers.findOne({
    memberId: userId,
    orgId: orgId,
    active: true,
  });
  if (!result)
    throw new AppError({
      httpCode: httpStatus.NOT_FOUND,
      description: 'User does not belong this organization',
    });
}

export const sortRecentlyModifiedinAscendingOrder = async () => {
  return await fileModel.find().sort({ updatedAt: 1 });
};

export const sortRecentlyModifiedinDescendingOrder = async () => {
  return await fileModel.find().sort({ updatedAt: -1 });
};

export const sortFileNameInAscendingOrder = async () => {
  return await fileModel.find().sort({ filename: -1 });
};

export const sortFileNameInDescendingOrder = async () => {
  return await fileModel.find().sort({ filename: 1 });
};

export default {
  getUserdetailsById,
  checkUserPermission,
  checkIfUserBelongsToOrganization,
};
