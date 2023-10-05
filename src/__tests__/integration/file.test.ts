import supertest from "supertest";
import app from "../../app";
import httpStatus from "http-status";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import { fileDataOne } from "../fixtures/file";
import { userOne } from "../fixtures/user.fixture";

const api = supertest(app);
let userDetails: any;

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
});

let users: any;
let userData: any;

const register = async () => {
  const payload = userOne;
  const url = "/api/user/signup";
  const { body } = await api.post(url).send(payload);

  users = body;
};

const Login = async () => {
  const payload = {
    email: users.data.email,
    password: userOne.password,
  };
  const url = "/api/user/login";
  const { body } = await api.post(url).send(payload);

  userData = body;
};

describe(" POST api/file/upload-request", () => {
  let userToken: any;
  beforeAll(async () => {
    await register();
    await Login();
  });
  test("should return an error when filename field is not passed", async () => {
    const url = "/api/file/upload-request";
    const { body } = await api
      .post(url)
      .send({})
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('"filename" is required.');
  });
  test("should create a file and return status code 200", async () => {
    const url = "/api/file/upload-request";
    const payload = fileDataOne;
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userData.data.token}`)
      .expect(httpStatus.OK);

    expect(body.message).toBe("request succesful");
    expect(body.status).toBe(true);
    expect(body.data.message).toBe("file upload initiated succesfully");
  });
});
