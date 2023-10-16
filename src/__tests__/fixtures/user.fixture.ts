import { faker } from "@faker-js/faker";
import Helper from "../../utils/helpers";

export const userOne = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  organizationName: faker.company.name(),
};

export const userTwo = {
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: faker.lorem.word(),
  organizationName: faker.company.name(),

};



export const userSix = {
  name: faker.person.fullName(),
};
