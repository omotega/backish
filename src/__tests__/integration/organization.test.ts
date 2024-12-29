import supertest from 'supertest';
import app from '../../app';
import testDb from '../testdb';
import {
  createUser,
  deleteOrganization,
  deleteOrgMember,
  deleteUsers,
  genToken,
} from '../helper/testhelper';
import { orgDataOne, orgDataTwo, userOne, userTwo } from '../fixtures/testData';
import { userRoles } from '../../utils/role';
import orgMembers from '../../database/model/orgMembers';
import httpStatus from 'http-status';
import organization from '../../database/model/organization';
import { afterEach } from 'node:test';
import { faker } from '@faker-js/faker';

const api = supertest(app);

testDb();

describe('GET api/org/org-users', () => {
  let userToken: any;
  beforeEach(async () => {
    await createUser(userOne);
    await createUser(userTwo);
    const orgMemberOne = {
      orgId: orgDataOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: orgDataOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('should list all the users in the organization', async () => {
    const url = `/api/org/org-users?orgId=${orgDataOne._id}&page=${1}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.docs.length).toBe(2);
    expect(body.totalDocs).toBe(2);
  });

  test('should return an empty object if there are no user in the organization', async () => {
    const url = `/api/org/org-users?orgId=${orgDataTwo._id}&page=${1}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.docs).toEqual([]);
    expect(body.totalDocs).toBe(0);
  });
});

describe('GET api/org/get-a-user', () => {
  let userToken: any, user: any, org: any;
  beforeEach(async () => {
    user = await createUser(userOne);
    await createUser(userTwo);
    org = await organization.insertMany([orgDataOne, orgDataTwo]);
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('should return the user details', async () => {
    const url = `/api/org/get-a-user?orgId=${orgDataOne._id}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({
      _id: expect.anything(),
      orgId: orgDataOne._id.toString(),
      memberId: {
        _id: user.id,
        name: userOne.name,
        email: userOne.email,
      },
      role: userRoles.guest,
    });
  });

  test('should return an error if user does not exist in the organization', async () => {
    const url = `/api/org/get-a-user?orgId=${orgDataTwo._id}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body).toMatchObject({ message: 'User does not belong this organization' });
  });
});

describe('PUT api/org/leave-org', () => {
  let userToken: any, user: any, org: any;
  beforeEach(async () => {
    user = await createUser(userOne);
    await createUser(userTwo);
    org = await organization.insertMany([orgDataOne, orgDataTwo]);
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('should remove a user from an organization', async () => {
    const url = `/api/org/leave-org/${org[0].id}`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({
      status: true,
      message: 'You have left the organization',
    });
  });
});

describe('GET api/org/usersorgs', () => {
  let userToken: any, user: any, org: any;
  beforeEach(async () => {
    user = await createUser(userOne);
    await createUser(userTwo);
    org = await organization.insertMany([orgDataOne, orgDataTwo]);
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[1]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('should return all the organization user belongs to', async () => {
    const url = `/api/org/userorgs?page=1`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.totalDocs).toBe(2);
  });

  test('should return an empty object if user does not belong to any organization ', async () => {
    await deleteOrgMember(), await deleteOrganization();
    const url = `/api/org/userorgs?page=1`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);
    expect(body.totalDocs).toBe(0);
  });
});

describe('PUT api/org/update-user-role', () => {
  let userToken: any, user: any, org: any;
  beforeEach(async () => {
    await createUser(userOne);
    user = await createUser(userTwo);
    org = await organization.insertMany([orgDataOne, orgDataTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('should update user role', async () => {
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });
    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
    const url = `/api/org/update-user-role?orgId=${org[0]._id}&collaboratorId=${userTwo._id}`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({
      status: true,
      message: 'user role updated',
    });

    const user = await orgMembers.findOne({ memberId: userTwo._id });
    expect(user).toMatchObject({
      _id: expect.anything(),
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.admin,
      __v: 0,
    });
  });

  test('should return an error when user is not an admin', async () => {
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[1]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });
    const url = `/api/org/update-user-role?orgId=${org[1]._id}&collaboratorId=${userTwo._id}`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_ACCEPTABLE);

    expect(body).toMatchObject({
      message: 'You are not authorized to carry out this operation.',
    });
  });
});

describe('PUT api/org/deactivate-user', () => {
  let userToken: any, user: any, org: any;
  beforeEach(async () => {
    user = await createUser(userOne);
    await createUser(userTwo);
    org = await organization.insertMany([orgDataOne, orgDataTwo]);
  });

  afterEach(async () => {
    await deleteOrgMember();
    await deleteUsers();
    await deleteOrganization();
  });

  test('Should deactivate a user ', async () => {
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
    const url = `/api/org/deactivate-user?orgId=${org[0]._id}&collaboratorId=${userTwo._id}`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({ status: true, message: 'user deactivated succesfully' });

    const member = await orgMembers.findOne({ orgId: org[0]._id, memberId: userTwo._id });
    expect(member).toMatchObject({
      _id: expect.anything(),
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: 'guest',
      active: false,
      __v: 0,
    });
  });

  test('Should return an error if user is not authorized ', async () => {
    const orgMemberOne = {
      orgId: org[0]._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };
    const orgMemberTwo = {
      orgId: org[0]._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word()
    };

    userToken = await genToken({
      userId: userOne._id,
      email: userOne.email,
    });

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);
    const url = `/api/org/deactivate-user?orgId=${org[0]._id}&collaboratorId=${userTwo._id}`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_ACCEPTABLE);

    expect(body).toMatchObject({
      message: 'You are not authorized to carry out this operation.',
    });
  });
});
