import supertest from "supertest";
import app from "../../app";
import {
  userFour,
  userOne,
  userSix,
  userThree,
  userTwo,
} from "../fixtures/user.fixture";
import httpStatus from "http-status";
import Helper from "../../utils/helpers";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import * as sendEmailService from "../../utils/sendemail";

const api = supertest(app);
let userDetails: any;

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
});

let userData: any;
describe(" POST api/user/signup", () => {
  test("Should register a user when the body is correct", async () => {
    const payload = userOne;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.CREATED);
    userDetails = body.data;
    expect(body).toMatchObject({
      success: true,
      message: "User registration successful",
      data: {
        name: payload.name,
        email: payload.email,
        password: Helper.hashPassword(payload.password),
      },
    });
  });
  test("Should return error when email field is not passed", async () => {
    const payload = userTwo;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });

  test("Should return error when name field is not passed", async () => {
    const payload = userThree;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('" name" is required.');
  });

  test("Should return error when  password field is not passed", async () => {
    const payload = userFour;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });
});

describe(" POST /api/user/login", () => {
  test("Should login a user when the request body is correct", async () => {
    const payload = {
      email: userDetails.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);

    expect(body.data.isUser.email).toBe(payload.email);
  });

  test("Should return error if email is not correct correct", async () => {
    const payload = {
      email: userThree.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe(messages.USER_LOGIN_ERROR);
  });

  test("Should return error if password is not  correct", async () => {
    const payload = {
      email: userDetails.email,
      password: faker.lorem.word(),
    };
    const url = "/api/user/login";
    const { body, statusCode } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe(messages.INCORRECT_PASSWORD);
  });

  test("Should return error if password field is empty", async () => {
    const payload = {
      email: userDetails.email,
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });

  test("Should return error if email field is empty", async () => {
    const payload = {
      password: faker.lorem.word(),
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});

describe(" POST /api/user/update-profile", () => {
  let userData: any;
  beforeAll(async () => {
    const payload = {
      email: userDetails.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api.post(url).send(payload);

    userData = body;
  });

  test("Should update the user name and return a status code of 200", async () => {
    const payload = userSix;
    const url = "/api/user/update-profile";
    const { body } = await api
      .put(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.OK);

    expect(body.data.name).toBe(payload.name);
  });

  test("Should return an error when name field is empty", async () => {
    const url = "/api/user/update-profile";
    const { body } = await api
      .put(url)
      .send({})
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('" name" is required.');
  });

  test("Should return an error when user is not logged in", async () => {
    const url = "/api/user/update-profile";
    const { body } = await api.put(url).send({}).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe("authorization not found");
  });
});

describe(" POST /api/user/invite-user", () => {
  let userData: any;
  let emailSpy: any;
  beforeAll(async () => {
    const payload = {
      email: userDetails.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api.post(url).send(payload);

    userData = body;

    emailSpy = jest.spyOn(sendEmailService, "default");
  });

  test("Should send an email and return a status code of 200", async () => {
    const payload = {
      orgId: userDetails.orgId[0],
      email: faker.internet.email(),
    };
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.OK);

    expect(emailSpy).toBeCalledTimes(1);
    expect(body).toMatchObject({
      success: true,
      message: "Invitation sent successfully",
    });
  });

  test("Should return an error if organization doesnt exist", async () => {
    const payload = {
      orgId: faker.database.mongodbObjectId(),
      email: faker.internet.email(),
    };
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe("organization not found");
  });

  test("Should return an error when user is not logged in", async () => {
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send({})
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe("authorization not found");
  });

  test("Should return an error if organId field is empty ", async () => {
    const payload = {
      email: faker.internet.email(),
    };
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test("Should return an error if email field is empty ", async () => {
    const payload = {
      orgId: faker.database.mongodbObjectId(),
      
    };
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});
