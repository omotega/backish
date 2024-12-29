import { faker } from '@faker-js/faker';
import mongoose from 'mongoose';
import { userRoles } from '../../utils/role';

export const fileDataOne = {
  filename: faker.lorem.word(),
  url: faker.image.url(),
  format: '',
  size: '',
};

export const userOne = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  organizationName: faker.company.name(),
  username: faker.person.middleName(),
};

export const userTwo = {
  _id: new mongoose.Types.ObjectId(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  organizationName: faker.company.name(),
  username: faker.person.middleName(),
};

export const userSix = {
  name: faker.person.fullName(),
};

export const orgDataOne = {
  _id: new mongoose.Types.ObjectId(),
  orgName: faker.company.name(),
};

export const orgDataTwo = {
  _id: new mongoose.Types.ObjectId(),
  orgName: faker.company.name(),
};

export const folderDataOne = {
  folderName: faker.commerce.product(),
  orgId: orgDataOne._id,
  description: faker.lorem.word(),
  isStarred: false,
};

export const folderDataTwo = {
  folderName: faker.lorem.word(),
  orgId: orgDataTwo._id,
  description: faker.lorem.word(),
  isStarred: false,
};
