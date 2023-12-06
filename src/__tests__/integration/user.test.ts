import supertest from "supertest";
import app from "../../app";
import { userOne } from "../fixtures/user.fixture";
import httpStatus from "http-status";
import Helper from "../../utils/helpers";
import messages from "../../utils/messages";
import { faker } from "@faker-js/faker";
import testDb from "../testdb";
import * as sendEmailService from "../../utils/sendemail";
import {
  createInvite,
  createUser,
  deleteInvites,
  deleteOrganization,
  deleteUsers,
  genToken,
} from "../helper/testhelper";
import testdb from "../testdb";
import organization from "../../database/model/organization";
import usermodel from "../../database/model/usermodel";
import { AppError } from "../../utils/errors";

const api = supertest(app);

beforeAll(async () => {
  testDb.dbConnect();
});

afterAll(async () => {
  testDb.dbDisconnect();
  testdb.dbCleanUp();
});

describe(" POST api/user/signup", () => {
  test.skip("Should register a user when the body is correct", async () => {
    const payload = userOne;
    const url = "/api/user/signup";
    const hashedPayload = await Helper.hashPassword(payload.password);
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
        password: hashedPayload,
      },
    });
  });
  test("Should return error when email field is not passed", async () => {
    const payload = {
      name: userOne.name,
      password: userOne.password,
    };
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });

  test("Should return error when name field is not passed", async () => {
    const payload = {
      email: userOne.email,
      password: userOne.password,
    };
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('" name" is required.');
  });

  test("Should return error when  password field is not passed", async () => {
    const payload = {
      name: userOne.name,
      email: userOne.email,
    };
    const url = "/api/user/signup";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });
});

describe(" POST /api/user/login", () => {
  let userValue: any;
  beforeEach(async () => {
    userValue = await createUser({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await Helper.hashPassword(userOne.password),
      organizationName: faker.company.name(),
    });
  });

  afterEach(async () => {
    await deleteUsers();
  });

  test("Should login a user when the request body is correct", async () => {
    const payload = {
      email: userValue.email,
      password: userOne.password,
    };
    const url = "/api/user/login";
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);

    expect(body.data.isUser.email).toBe(payload.email);
  });

  test("Should return error if email is not correct correct", async () => {
    const payload = {
      email: faker.internet.email(),
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
      email: userValue.email,
      password: faker.lorem.word(),
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe(messages.INCORRECT_PASSWORD);
  });

  test("Should return error if password field is empty", async () => {
    const payload = {
      email: userValue.email,
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
      password: userValue.password,
    };
    const url = "/api/user/login";
    const { body } = await api
      .post(url)
      .send(payload)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});

 describe(" PATCH /api/user/update-profile", () => {
   let userValue: any;
   let userToken:any
   beforeEach(async () => {
     userValue = await createUser({
       name: faker.person.fullName(),
       email: faker.internet.email(),
       password: await Helper.hashPassword(userOne.password),
       organizationName: faker.company.name(),
     });

     userToken = await genToken({
      userId: userValue._id,
      email: userValue.email,
    });
   });
 
   afterEach(async () => {
     await deleteUsers();
   });
  

   test("Should update the user name and return a status code of 200", async () => {
     const payload = {name:faker.person.fullName()}
     const url = "/api/user/update-profile";
     const { body } = await api
       .put(url)
       .send(payload)
    .set("Authorization", `Bearer ${userToken}`)
       .expect(httpStatus.OK);

     expect(body.data.name).toBe(payload.name);
   });

   test("Should return an error when name field is empty", async () => {
     const url = "/api/user/update-profile";
     const { body } = await api
       .put(url)
       .send({})
       .set("Authorization", `Bearer ${userToken}`)
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
  let emailSpy: any;
  let userValue: any;
  let userToken: any;
  let orgOne:any;
  beforeEach(async () => {
    orgOne = await organization.create({
      orgName: faker.company.name(),
    });
    userValue = await createUser({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await Helper.hashPassword(userOne.password),
      orgStatus: [
        {
          orgId: orgOne._id,
          roleInOrg: "super-admin",
        },
      ],
    })
    userToken = await genToken({
      userId: userValue._id,
      email: userValue.email,
    })
    emailSpy = jest.spyOn(sendEmailService, "default");
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await deleteUsers();
    await deleteOrganization();
  });
  test("Should send an email and return a status code of 200", async () => {
    const payload = {
      orgId: userValue.orgStatus[0].orgId,
      email: faker.internet.email(),
    };
    const url = "/api/user/invite-user";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
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
      .set("Authorization", `Bearer ${userToken}`)
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
      .set("Authorization", `Bearer ${userToken}`)
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
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});

describe(" POST /api/user/confirm-invite", () => {
  let userValueOne: any;
  let userValueTwo: any;
  let userToken: any;
  let reference: any;
  let referenceTwo: any;
  let referenceThree: any;
  let invite: any;
  let inviteTwo: any;
  let inviteThree: any;
  let orgOne: any;
  let orgTwo: any;
  beforeEach(async () => {
    reference = Helper.generateRef();
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
    orgTwo = await organization.create({
      orgName: faker.company.name(),
    });
    userValueTwo = await createUser({
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: await Helper.hashPassword(userOne.password),
      orgStatus: [
        {
          orgId: orgTwo._id,
          roleInOrg: "super-admin",
        },
      ],
    });
    const expires_at = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    invite = await createInvite({
      email: userValueTwo.email,
      token: reference,
      expiresAt: expires_at,
      orgName: orgOne.orgName,
    });

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
    referenceTwo = Helper.generateRef();
    inviteTwo = await createInvite({
      email: userValueTwo.email,
      token: referenceTwo,
      expiresAt: expires_at,
    });
    referenceThree = Helper.generateRef();
    inviteThree = await createInvite({
      token: referenceThree,
      expiresAt: expires_at,
    });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await deleteUsers();
    await deleteInvites();
    await deleteOrganization();
  });

  test("Should register the user in the organization ", async () => {
    const referenceToken = Helper.generateRef();
    const payload = {
      reference: reference,
    };
    const url = "/api/user/confirm-invite";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.OK);
    const userOrgs = await usermodel.findOne({ _id: userValueTwo._id });
    const orgs = await organization.findOne({ _id: orgOne._id });
    if (!orgs)
      throw new AppError({
        httpCode: httpStatus.NOT_FOUND,
        description: "Organization not found",
      });
    if (!orgs.invitedEmails) return;
    const userExistInOrg: any = orgs.invitedEmails.find(
      (item) => userValueTwo.email === item
    );
    expect(orgs.invitedEmails[0]).toBe(userExistInOrg);
    expect(userOrgs?.orgStatus).toHaveLength(2);
    expect(body).toMatchObject({
      success: true,
      message: `you have succesfully joined ${orgOne.orgName} organization`,
    });
  });

  test("Should return an error if organization doesn't exist ", async () => {
    const payload = {
      reference: referenceTwo,
    };
    const url = "/api/user/confirm-invite";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe("Organization not found");
  });

  test("Should return an error if invite doesn't exist ", async () => {
    const referenceToken = Helper.generateRef();
    const payload = {
      reference: referenceToken,
    };
    const url = "/api/user/confirm-invite";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe("invite not found");
  });

  test("Should return an error if user doesn't exist have an account ", async () => {
    const referenceToken = Helper.generateRef();
    const payload = {
      reference: referenceThree,
    };
    const url = "/api/user/confirm-invite";
    const { body } = await api
      .post(url)
      .send(payload)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);
    expect(body.message).toBe(
      "You do not have an account. Please signup before you can confirm invite."
    );
  });

  test("Should return an error if reference field is not passed ", async () => {
    const url = "/api/user/confirm-invite";
    const { body } = await api
      .post(url)
      .send({})
      .set("Authorization", `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('"reference" is required.');
  });
});
