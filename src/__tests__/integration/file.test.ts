import supertest from "supertest";
import app from "../../app";
import httpStatus from "http-status";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import { fileDataOne } from "../fixtures/file";
import { userOne } from "../fixtures/user.fixture";
import {
  createUser,
  deleteOrganization,
  deleteUsers,
  genToken,
} from "../helper/testhelper";
import organization from "../../database/model/organization";
import Helper from "../../utils/helpers";

const api = supertest(app);

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
});

describe(" POST api/file/upload-request", () => {
  let userValueOne: any;
  let userToken: any;
  let orgOne: any;

  beforeEach(async () => {
    orgOne = await organization.create({
      orgName: faker.company.name(),
    });
    userValueOne = await createUser({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await Helper.hashPassword(userOne.password),
      orgStatus: [
        {
          orgId: orgOne._id,
          roleInOrg: "super-admin",
        },
      ],
      organizationName: faker.company.name(),
    });
    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await deleteUsers();
    await deleteOrganization();
  });

  test("should return an error when filename field is not passed", async () => {
    const url = "/api/file/upload-request";
    const { body } = await api
      .post(url)
      .send({})
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('"filename" is required.');
  });
  test("should create a file and return status code 200", async () => {
    const url = "/api/file/upload-request";
    const payload = fileDataOne;
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.message).toBe("request succesful");
    expect(body.status).toBe(true);
    expect(body.data.message).toBe("file upload initiated succesfully");
  });

  test("Should return an error when user is not logged in", async () => {
    const url = "/api/file/upload-request";
    const { body } = await api
      .post(url)
      .send({})
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe("authorization not found");
  });
});
