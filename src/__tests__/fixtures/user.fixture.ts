import { faker } from "@faker-js/faker";

export const userOne = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  organizationName: faker.company.name(),
  createdAt: faker.defaultRefDate().toISOString(),
  updatedAt: faker.defaultRefDate().toISOString(),
};

export const userTwo = {
  name: faker.person.fullName(),
  password: faker.lorem.word(),
  createdAt: faker.defaultRefDate().toISOString(),
  organizationName: faker.company.name(),
  updatedAt: faker.defaultRefDate().toISOString(),
};

export const userThree = {
  email: faker.internet.email(),
  password: faker.lorem.word(),
  createdAt: faker.defaultRefDate().toISOString(),
  updatedAt: faker.defaultRefDate().toISOString(),
  organizationName: faker.company.name(),
};

export const userFour = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.defaultRefDate().toISOString(),
  updatedAt: faker.defaultRefDate().toISOString(),
  organizationName: faker.company.name(),
};

export const userFive = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: faker.defaultRefDate().toISOString(),
  updatedAt: faker.defaultRefDate().toISOString(),
};
