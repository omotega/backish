import supertest from "supertest";
import app from "../../app";
import {
  userFour,
  userOne,
  userThree,
  userTwo,
} from "../fixtures/user.fixture";
import httpStatus from "http-status";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Helper from "../../utils/helpers";

const api = supertest(app);

beforeAll(async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoose.connection.close();
});

describe(" POST api/user/signup", () => {
  test("Should register a user when the body is currect", async () => {
    const payload = userOne;
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.CREATED);

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
