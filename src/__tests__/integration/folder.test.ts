import supertest from "supertest";
import app from "../../app";
import httpStatus from "http-status";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import { fileDataOne } from "../fixtures/file";
import { userOne } from "../fixtures/user.fixture";
import deleteFolder, {
  createFolder,
  createUser,
  deleteOrganization,
  deleteUsers,
  genToken,
} from "../helper/testhelper";
import organization from "../../database/model/organization";
import Helper from "../../utils/helpers";
import folder from "../../database/model/folder";
import { truncate } from "fs/promises";

const api = supertest(app);

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
});

describe(" POST api/folder/create-folder", () => {
  let userValueOne: any;
  let userToken: any;
  let userValueTwo: any;
  let orgOne: any;
  let folder: any;
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

    userValueTwo = await createUser({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await Helper.hashPassword(userOne.password),
      organizationName: faker.company.name(),
    });

    folder = await createFolder({
      foldername: "pictures",
      orgId: userValueOne.orgStatus[0].orgId,
      description: "To store pictures",
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
    await deleteFolder();
  });
  test("should create a folder and return statuscode 200", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: faker.commerce.product(),
      orgId: userValueOne.orgStatus[0].orgId,
      description: faker.lorem.word(),
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.CREATED);

    expect(body.status).toBe(true);
    expect(body.message).toBe("folder created");
    expect(body.data.foldername).toBe(payload.foldername);
    expect(body.data.orgId.toString()).toBe(payload.orgId.toString());
    expect(body.data.description).toBe(payload.description);
  });

  test("should throw an error when organization doesn't exist", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: faker.commerce.product(),
      orgId: userValueTwo._id,
      description: faker.lorem.word(),
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);
    expect(body.message).toBe("Organization  not found");
  });

  test("should throw an error when if folder already in organization", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: "pictures",
      orgId: userValueOne.orgStatus[0].orgId,
      description: "To store pictures",
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.CONFLICT);

    expect(body.message).toBe("Folder with name pictures already exist");
  });

  test("should throw an error when user is not logged in", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: "pictures",
      orgId: userValueOne.orgStatus[0].orgId,
      description: "To store pictures",
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe("authorization not found");
  });

  test("should throw an error when foldername field empty", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      orgId: userValueOne.orgStatus[0].orgId,
      description: "To store pictures",
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"folder name" is required.');
  });

  test("should throw an error when if orgId field is empty", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: "pictures",
      description: "To store pictures",
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test("should throw an error when if description field is empty", async () => {
    const url = "/api/folder/create-folder";
    const payload = {
      foldername: faker.commerce.product(),
      orgId: userValueTwo._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"description" is required.');
  });
});

describe(" POST api/folder/star-folder", () => {
  let userValueOne: any;
  let userToken: any;
  let userValueTwo: any;
  let orgOne: any;
  let orgTwo: any;
  let folder: any;
  let folderTwo: any;
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

    folder = await createFolder({
      foldername: faker.commerce.product(),
      orgId: userValueOne.orgStatus[0].orgId,
      description: faker.lorem.word(),
      isStarred: false,
    });
    orgTwo = await organization.create({
      orgName: faker.company.name(),
    });
    userValueTwo = await createUser({
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

    folderTwo = await createFolder({
      foldername: faker.commerce.product(),
      orgId: userValueTwo.orgStatus[0].orgId,
      description: faker.lorem.word(),
      isStarred: true,
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
    await deleteFolder();
  });

  test("should  star a folder and return statuscode 200", async () => {
    const url = "/api/folder/star-folder";
    const payload = {
      orgId: folder.orgId,
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.status).toBe(true);
    expect(body.message).toBe("folder starred");
    expect(body.data.isStarred).toBe(true);
    expect(body.data.foldername).toBe(folder.foldername);
  });

  test("should return an error if organization doesnt exist", async () => {
    const url = "/api/folder/star-folder";
    const payload = {
      orgId: userValueOne._id,
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe("Organization not found");
  });
  test("should return an error if orgId field is empty", async () => {
    const url = "/api/folder/star-folder";
    const payload = {
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test("should return an error if folderId field is empty", async () => {
    const url = "/api/folder/star-folder";
    const payload = {
      orgId: folder.orgId,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"folderid" is required.');
  });
});

describe(" POST api/folder/unstar-folder", () => {
  let userValueOne: any;
  let userToken: any;
  let userValueTwo: any;
  let orgOne: any;
  let orgTwo: any;
  let folder: any;
  let folderTwo: any;
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

    folder = await createFolder({
      foldername: faker.commerce.product(),
      orgId: userValueOne.orgStatus[0].orgId,
      description: faker.lorem.word(),
      isStarred: true,
    });
    orgTwo = await organization.create({
      orgName: faker.company.name(),
    });
    userValueTwo = await createUser({
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

    folderTwo = await createFolder({
      foldername: faker.commerce.product(),
      orgId: userValueTwo.orgStatus[0].orgId,
      description: faker.lorem.word(),
      isStarred: true,
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
    await deleteFolder();
  });

  test("should  unstar a folder and return statuscode 200", async () => {
    const url = "/api/folder/unstar-folder";
    const payload = {
      orgId: folder.orgId,
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.status).toBe(true);
    expect(body.message).toBe("folder unstarred");
    expect(body.data.isStarred).toBe(false);
    expect(body.data.foldername).toBe(folder.foldername);
  });

  test("should return an error if organization doesnt exist", async () => {
    const url = "/api/folder/unstar-folder";
    const payload = {
      orgId: userValueOne._id,
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe("Organization not found");
  });
  test("should return an error if orgId field is empty", async () => {
    const url = "/api/folder/unstar-folder";
    const payload = {
      folderId: folder._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test("should return an error if folderId field is empty", async () => {
    const url = "/api/folder/unstar-folder";
    const payload = {
      orgId: folder.orgId,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"folderid" is required.');
  });
});
