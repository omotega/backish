import mongoose from 'mongoose';
import folder from '../../database/model/folder';
import membership from '../../database/model/membership';
import organization from '../../database/model/organization';
import orgMembers from '../../database/model/orgMembers';
import usermodel from '../../database/model/usermodel';
import Helper from '../../utils/helpers';

export async function createUser(payload: any) {
  return usermodel.create(payload);
}

export async function createOrganization(payload: any) {
  return organization.create(payload);
}

export async function genToken({
  userId,
  email,
}: {
  userId: string | mongoose.Types.ObjectId;
  email: string;
}) {
  const token = await Helper.generateToken({ userId: userId, email: email });
  return token;
}

export async function deleteUsers() {
  return usermodel.deleteMany({});
}

export async function createInvite(payload: any) {
  return membership.create(payload);
}
export async function deleteInvites() {
  await membership.deleteMany({});
}

export async function deleteOrganization() {
  return organization.deleteMany({});
}

export async function createFolder(payload: any) {
  return folder.create(payload);
}

export async function deleteFolder() {
  return folder.deleteMany({});
}

export async function createOrgMember(payload: any) {
  return orgMembers.create(payload);
}

export async function deleteOrgMember() {
  return orgMembers.deleteMany({});
}
