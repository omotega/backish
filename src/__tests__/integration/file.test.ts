import supertest from "supertest";
import app from "../../app";
import httpStatus from "http-status";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import { fileDataOne } from "../fixtures/testData";
import { userOne } from "../fixtures/testData";
import {
  createUser,
  deleteOrganization,
  deleteUsers,
  genToken,
} from "../helper/testhelper";
import organization from "../../database/model/organization";
import Helper from "../../utils/helpers";
import testDB from "../testdb";

const api = supertest(app);

testDB()

