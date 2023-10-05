import supertest from "supertest";
import app from "../../app";
import httpStatus from "http-status";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import { fileDataOne } from "../fixtures/file";

const api = supertest(app);
let userDetails: any;

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
});

describe(" POST api/file/upload-request", () => {
  test("should return an error when filename field is not passed", async () => {
    const url = "/api/file/upload-request";
    const { body } = await api
      .post(url)
      .send({})
      .expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('"filename" is required.');
  });
  test("should create a file and return status code 200", async () => {
    const url = "/api/file/upload-request";
    const payload = fileDataOne;
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);
  });
});
