import supertest from 'supertest';
import app from '../../app';
import { userOne, userTwo } from '../fixtures/testData';
import httpStatus from 'http-status';
import Helper from '../../utils/helpers';
import messages from '../../utils/messages';
import { faker } from '@faker-js/faker';
import * as sendEmailService from '../../utils/email';
import {
  createInvite,
  createUser,
  deleteInvites,
  deleteOrganization,
  deleteOrgMember,
  deleteUsers,
  genToken,
} from '../helper/testhelper';
import testdb from '../testdb';
import organization from '../../database/model/organization';
import usermodel from '../../database/model/usermodel';
import { AppError } from '../../utils/errors';
import { userRoles } from '../../utils/role';
import orgMembers from '../../database/model/orgMembers';

const api = supertest(app);

testdb();

describe('POST api/user/signup', () => {
  afterEach(async () => {
    deleteUsers();
    deleteOrganization();
    deleteOrgMember();
  });
  test('Should register a user when the body is correct', async () => {
    const payload = { ...userOne, userName: faker.lorem.word() };
    const url = '/api/user/signup';
    const { body } = await api.post(url).send(payload).expect(httpStatus.CREATED);
    expect(body).toMatchObject({
      status: true,
      message: [
        {
          name: payload.name,
          email: payload.email,
          _id: expect.anything(),
          createdAt: expect.anything(),
          updatedAt: expect.anything(),
          __v: 0,
        },
      ],
    });
    const user = await usermodel.findById(body.message[0]._id);
    expect(user).toMatchObject({
      _id: expect.anything(),
      name: payload.name,
      email: payload.email,
      password: expect.anything(),
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      __v: 0,
    });
    const org = await organization.findOne({ orgName: payload.organizationName });
    expect(org).toMatchObject({
      _id: expect.anything(),
      orgName: payload.organizationName,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      __v: 0,
    });
    const orgmember = await orgMembers.findOne({
      orgId: org?.id,
      memberId: user?.id,
      userName: payload.userName,
    });
    expect(orgmember).toMatchObject({
      _id: expect.anything(),
      orgId: org?._id,
      memberId: user?._id,
      role: userRoles.admin,
      active: true,
      userName: payload.userName,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      __v: 0,
    });
  });
  test('Should return error when email field is not passed', async () => {
    const payload = {
      name: userOne.name,
      password: userOne.password,
      organizationName: faker.word.noun(),
      userName: faker.lorem.word(),
    };
    const url = '/api/user/signup';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('"email  is required!"');
  });

  test('Should return error when name field is not passed', async () => {
    const payload = {
      email: userOne.email,
      password: userOne.password,
      organizationName: faker.word.noun(),
      userName: faker.lorem.word(),
    };
    const url = '/api/user/signup';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);
    expect(body.message).toBe('" name" is required.');
  });

  test('Should return error when  password field is not passed', async () => {
    const payload = {
      name: userOne.name,
      email: userOne.email,
      organizationName: faker.word.noun(),
      userName: faker.lorem.word(),
    };
    const url = '/api/user/signup';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });
});

describe('POST /api/user/login', () => {
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

  test('Should login a user when the request body is correct', async () => {
    const payload = {
      email: userValue.email,
      password: userOne.password,
    };
    const url = '/api/user/login';
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);

    expect(body).toMatchObject({ status: true, message: 'login successful' });
  });

  test('Should return error if email is not correct correct', async () => {
    const payload = {
      email: faker.internet.email(),
      password: userOne.password,
    };
    const url = '/api/user/login';
    const { body } = await api.post(url).send(payload).expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe(messages.USER_LOGIN_ERROR);
  });

  test('Should return error if password is not correct', async () => {
    const payload = {
      email: userValue.email,
      password: faker.lorem.word(),
    };
    const url = '/api/user/login';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe(messages.INCORRECT_PASSWORD);
  });

  test('Should return error if password field is empty', async () => {
    const payload = {
      email: userValue.email,
    };
    const url = '/api/user/login';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"password" is required!');
  });

  test('Should return error if email field is empty', async () => {
    const payload = {
      password: userValue.password,
    };
    const url = '/api/user/login';
    const { body } = await api.post(url).send(payload).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});

describe('PATCH /api/user/update-profile', () => {
  let userValue: any;
  let userToken: any;
  beforeEach(async () => {
    userValue = await createUser({
      ...userOne,
      password: await Helper.hashPassword(userOne.password),
    });

    userToken = await genToken({
      userId: userValue._id,
      email: userValue.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
  });

  test('Should update the user name and return a status code of 200', async () => {
    const payload = { name: faker.person.fullName() };
    const url = '/api/user/update-profile';
    const { body } = await api
      .put(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({
      status: true,
      messages: 'User details updated succesfully',
    });
  });

  test('Should return an error when name field is empty', async () => {
    const url = '/api/user/update-profile';
    const { body } = await api
      .put(url)
      .send({})
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('" name" is required.');
  });

  test('Should return an error when user is not logged in', async () => {
    const url = '/api/user/update-profile';
    const { body } = await api.put(url).send({}).expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('Authorization not found');
  });
});

describe('POST /api/user/invite-user', () => {
  let emailSpy: any;
  let userValue: any;
  let userToken: any;
  let orgOne: any;
  beforeEach(async () => {
    orgOne = await organization.create({
      orgName: faker.company.name(),
    });
    userValue = await createUser({
      ...userOne,
      password: await Helper.hashPassword(userOne.password),
    });

    await createUser({
      ...userTwo,
      password: await Helper.hashPassword(userTwo.password),
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: 'valada',
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.create(orgMemberOne);
    emailSpy = jest
      .spyOn(sendEmailService, 'sendEmail')
      .mockImplementationOnce(() => Promise.resolve(true));
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await deleteUsers();
    await deleteOrganization();
  });

  test('Should send an email and return a status code of 200', async () => {
    const payload = {
      orgId: orgOne._id,
      email: faker.internet.email(),
    };
    const url = '/api/user/invite-user';
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(emailSpy).toBeCalledTimes(1);
    expect(body).toMatchObject({
      status: true,
      message: 'invite sent succesful',
    });
  });

  test('Should return an error if user is not authorized to invite user', async () => {
    const payload = {
      orgId: faker.database.mongodbObjectId(),
      email: faker.internet.email(),
    };
    const url = '/api/user/invite-user';
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_ACCEPTABLE);

    expect(body.message).toBe('You are not authorized to carry out this operation.');
  });

  test('Should return an error if organId field is empty ', async () => {
    const payload = {
      email: faker.internet.email(),
    };
    const url = '/api/user/invite-user';
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test('Should return an error if email field is empty ', async () => {
    const payload = {
      orgId: faker.database.mongodbObjectId(),
    };
    const url = '/api/user/invite-user';
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"email  is required!"');
  });
});

describe('POST /api/user/confirm-invite', () => {
  let userValueOne: any;
  let userValueTwo: any;
  let userToken: any;
  let reference: any;
  let referenceTwo: any;
  let referenceThree: any;
  let invite: any;
  let inviteTwo: any;
  let orgOne: any;
  beforeEach(async () => {
    orgOne = await organization.create({
      orgName: faker.company.name(),
    });
    userValueOne = await createUser({
      ...userOne,
      password: await Helper.hashPassword(userOne.password),
    });
    userValueTwo = await createUser({
      ...userTwo,
      password: await Helper.hashPassword(userTwo.password),
    });
    const expires_at = new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000);
    invite = await createInvite({
      email: userValueTwo.email,
      token: Helper.generateRef(),
      expiresAt: expires_at,
      orgId: orgOne._id,
      valid: true,
      userId: userTwo._id,
    });

    userToken = await genToken({
      userId: userOne._id,
      email: userValueOne.email,
    });
    referenceTwo = Helper.generateRef();
    inviteTwo = await createInvite({
      email: userValueTwo.email,
      token: referenceTwo,
      expiresAt: expires_at,
      valid: true,
      orgId: orgOne._id,
      userId: userTwo._id,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: 'valada',
    };
    await orgMembers.create(orgMemberOne);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await deleteUsers();
    await deleteInvites();
    await deleteOrganization();
    await deleteOrgMember();
  });

  test('Should register the user in the organization ', async () => {
    const payload = {
      reference: invite.token,
      username: faker.lorem.word(),
    };
    const url = `/api/user/confirm-invite?orgId=${orgOne.id}`;
    const { body } = await api.post(url).send(payload).expect(httpStatus.OK);

    const orgmemember = await orgMembers.findOne({
      orgId: orgOne.id,
      userName: payload.username,
      memberId: userTwo._id,
    });
    expect(orgmemember).toMatchObject({
      _id: expect.anything(),
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      active: true,
      userName: payload.username,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
    });
  });

  test("Should return an error if invite doesn't exist ", async () => {
    const referenceToken = Helper.generateRef();
    const payload = {
      reference: referenceToken,
      username: faker.lorem.word(),
    };
    const url = `/api/user/confirm-invite?orgId=${orgOne.id}`;
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe('invite not found');
  });
});
