import supertest from 'supertest';
import app from '../../app';
import httpStatus from 'http-status';
import { faker } from '@faker-js/faker';
import {
  fileDataOne,
  folderDataOne,
  folderDataTwo,
  orgDataOne,
  userOne,
  userTwo,
} from '../fixtures/testData';
import {
  createFolder,
  createUser,
  deleteFolder,
  deleteOrganization,
  deleteOrgMember,
  deleteUsers,
  genToken,
} from '../helper/testhelper';
import organization from '../../database/model/organization';
import folderModel from '../../database/model/folder';
import Helper from '../../utils/helpers';
import testdb from '../testdb';
import orgMembers from '../../database/model/orgMembers';
import { userRoles } from '../../utils/role';
import errorMessages from '../../utils/messages';
import Folder from '../../database/model/folder';

const api = supertest(app);

testdb();

describe('POST /api/folder/:orgId/create-folder', () => {
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
      ...userOne,
      password: await Helper.hashPassword(userOne.password),
    });

    userValueTwo = await createUser({
      ...userTwo,
      password: await Helper.hashPassword(userTwo.password),
    });

    userToken = await genToken({
      userId: userOne._id,
      email: userValueOne.email,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.create(orgMemberOne);
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });
  test('should create a folder and return statuscode 200 when folderId is not passed', async () => {
    const url = `/api/folder/${orgOne._id}/create-folder/`;
    const payload = {
      foldername: faker.commerce.productName(),
      description: faker.lorem.word(),
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.CREATED);

    expect(body).toMatchObject({
      status: true,
      response: 'folder created succesfully',
    });

    const isFolder = await folderModel.findOne({ folderName: payload.foldername });
    expect(isFolder).toMatchObject({
      _id: expect.anything(),
      folderName: payload.foldername,
      folderId: [],
      createdBy: expect.anything(),
      collaborators: [userOne._id],
      orgId: orgOne._id,
      description: payload.description,
      isPinned: false,
      isArchived: false,
      isStarred: false,
      isTrashed: false,
      isLocked: false,
      isDeleted: false,
      existInHomeDirectory: true,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      __v: 0,
    });
  });

  test('should create a folder and return statuscode 200 when folderId is passed', async () => {
    const folder = await createFolder({
      folderName: faker.commerce.productName(),
      description: faker.lorem.word(),
    });

    const url = `/api/folder/${orgOne._id}/create-folder?folderId=${folder._id}`;
    const payload = {
      foldername: faker.commerce.productName(),
      description: faker.lorem.word(),
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.CREATED);

    expect(body).toMatchObject({
      status: true,
      response: 'folder created succesfully',
    });

    const isFolder = await folderModel.findOne({ folderName: payload.foldername });
    expect(isFolder).toMatchObject({
      _id: expect.anything(),
      folderName: payload.foldername,
      folderId: [folder._id],
      createdBy: expect.anything(),
      collaborators: [userOne._id],
      orgId: orgOne._id,
      description: payload.description,
      isPinned: false,
      isArchived: false,
      isStarred: false,
      isTrashed: false,
      isLocked: false,
      isDeleted: false,
      existInHomeDirectory: false,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
      __v: 0,
    });
  });

  test("should throw an error when organization doesn't exist", async () => {
    const orgId = faker.database.mongodbObjectId();
    const url = `/api/folder/${orgId}/create-folder`;
    const payload = {
      foldername: faker.commerce.product(),
      orgId: userValueTwo._id,
      description: faker.lorem.word(),
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe('User does not belong this organization');
  });

  test('should throw an error when if folder already in organization', async () => {
    const folder = await createFolder({
      folderName: 'pictures',
      description: faker.lorem.word(),
      orgId: orgOne._id,
    });
    const url = `/api/folder/${orgOne._id}/create-folder`;
    const payload = {
      foldername: 'pictures',
      description: 'To store pictures',
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.CONFLICT);

    expect(body.message).toBe('Folder with name pictures already exist');
  });

  test('should throw an error when foldername field empty', async () => {
    const url = `/api/folder/${orgOne._id}/create-folder`;
    const payload = {
      description: 'To store pictures',
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"folder name" is required.');
  });

  test('should throw an error when if description field is empty', async () => {
    const url = `/api/folder/${orgOne._id}/create-folder`;
    const payload = {
      foldername: faker.commerce.product(),
      orgId: userValueTwo._id,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"description" is required.');
  });
});

describe('POST /api/folder/star-folder', () => {
  let userValueOne: any;
  let userToken: any;
  let orgOne: any;
  let orgTwo: any;
  let folder: any;
  let folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser({
      ...userOne,
      password: await Helper.hashPassword(userOne.password),
    });

    folder = await createFolder(folderDataOne);
    orgTwo = await organization.create({
      orgName: faker.company.name(),
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: true,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should  star a folder and return statuscode 200', async () => {
    const url = `/api/folder/star-folder?folderId=${folder.id}&orgId=${orgOne.id}`;
    const { body } = await api
      .post(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({ status: true, message: 'Folder starred successfully' });

    const isFolder = await folderModel.findById(folder._id);
    expect(isFolder?.isStarred).toBe(true);
  });

  test('should return an error if organization doesnt exist', async () => {
    const orgId = faker.database.mongodbObjectId();
    const url = `/api/folder/star-folder?folderId=${folder.id}&orgId=${orgId}`;

    const { body } = await api
      .post(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);

    expect(body.message).toBe('User does not belong this organization');
  });
  test('should return an error if orgId field is empty', async () => {
    const url = `/api/folder/star-folder?folderId=${folder.id}`;
    const { body } = await api
      .post(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"org id" is required.');
  });

  test('should return an error if folderId field is empty', async () => {
    const url = `/api/folder/star-folder?orgId=${orgOne.id}`;
    const payload = {
      orgId: folder.orgId,
    };
    const { body } = await api
      .post(url)
      .send(payload)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.BAD_REQUEST);

    expect(body.message).toBe('"folderid" is required.');
  });
});

describe('POST /api/folder/unstar-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: true,
    });
    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
  });

  test('should  unstar a folder and return statuscode 200', async () => {
    const url = `/api/folder/unstar-folder?folderId=${folder._id}&orgId=${orgOne._id}`;
    const { body } = await api
      .post(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body).toMatchObject({
      status: true,
      message: 'Folder unstarred successfully',
    });

    const folderExist = await folderModel.findById(folder._id);

    expect(folderExist?.isStarred).toBeFalsy();
  });

  test('should return an error if organization doesnt exist', async () => {
    const url = `/api/folder/unstar-folder?folderId=${folder._id}&orgId=${folder._id}`;
    const { body } = await api
      .post(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.NOT_FOUND);
    expect(body.message).toBe('User does not belong this organization');
  });
});

describe('GET /api/folder/starred-folders', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: true,
    });
    await createFolder({
      ...folderDataTwo,
      orgId: orgDataOne._id,
      isStarred: true,
    });
    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
  });

  test('should list all stared folder in organization and return statuscode 200', async () => {
    const url = `/api/folder/starred-folders?orgId=${orgOne._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(2);
  });

  test('should return an error if organization doesnt exist', async () => {
    const url = `/api/folder/starred-folders?orgId=${folder._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);
    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(0);
  });
});

describe('GET /api/folder/folders', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: true,
    });
    await createFolder({
      ...folderDataTwo,
      orgId: orgDataOne._id,
      isStarred: true,
    });
    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
  });

  test('should list all stared folder in organization and return statuscode 200', async () => {
    const url = `/api/folder/folders?orgId=${orgOne._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(2);
  });

  test('should return an error if organization doesnt exist', async () => {
    const url = `/api/folder/folders?orgId=${folder._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);
    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(0);
  });
});

describe('GET /api/folder/unstarred-folders', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
    });
    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should list all stared folder in organization and return statuscode 200', async () => {
    const url = `/api/folder/unstarred-folders?orgId=${orgOne._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);

    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(2);
  });

  test('should return an error if organization doesnt exist', async () => {
    const url = `/api/folder/unstarred-folders?orgId=${folder._id}&page=${'1'}`;
    const { body } = await api
      .get(url)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(httpStatus.OK);
    expect(body.status).toBe(true);
    expect(body.response.totalDocs).toBe(0);
  });
});

describe('PUT /api/folder/:folderId/update-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should update the folder details', async () => {
    const payload = {
      folderName: faker.commerce.productName(),
      description: faker.word.words(),
      orgId: orgOne.id,
    };

    const url = `/api/folder/${folder.id}/update-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    expect(body.data.folderName).toBe(payload.folderName);
    expect(body.data.description).toBe(payload.description);
  });

  test('should return an error if folder doesnt exist', async () => {
    const folderId = faker.database.mongodbObjectId();
    const payload = {
      folderName: faker.commerce.productName(),
      description: faker.word.words(),
      orgId: orgOne.id,
    };
    const url = `/api/folder/${folderId}/update-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    expect(body).toMatchObject({
      message: 'Folder not found',
    });
  });

  test('should return an error if folder name already exist', async () => {
    const payload = {
      folderName: 'folder',
      description: faker.word.words(),
      orgId: orgOne.id,
    };

    const url = `/api/folder/${folder.id}/update-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload);
    expect(httpStatus.CONFLICT);

    expect(body).toMatchObject({
      message: 'folder already exist. Kindly input a different one',
    });
  });
});

describe('PUT /api/folder/:folderId/add-folder-access', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should add a user as collaborator to a folder', async () => {
    const payload = {
      collaboratorId: userTwo._id.toString(),
      orgId: orgOne.id,
    };

    const url = `/api/folder/${folder.id}/add-folder-access`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.findById(folder._id);

    expect(isFolder?.collaborators[0].toString()).toBe(userTwo._id.toString());

    expect(body).toMatchObject({
      status: true,
      message: `${userTwo.name} Added  as collaborator  to ${folder.folderName} Folder`,
    });
  });
  test('should return an error if folderId is invalid', async () => {
    const payload = {
      collaboratorId: userTwo._id.toString(),
      orgId: orgOne.id,
    };
    const folderId = faker.database.mongodbObjectId();

    const url = `/api/folder/${folderId}/add-folder-access`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });

  test('should return an error if collaborator does not belong to the organization', async () => {
    await orgMembers.findOneAndUpdate(
      { memberId: userTwo._id },
      { memberId: userOne._id, active: false }
    );
    const payload = {
      collaboratorId: userTwo._id.toString(),
      orgId: orgOne.id,
    };

    const url = `/api/folder/${folder._id}/add-folder-access`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    expect(body).toMatchObject({
      message: 'User does not belong this organization',
    });
  });
});

describe('PUT /api/folder/archive-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should archive a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: [folder._id, folderTwo._id],
    };

    const url = `/api/folder/archive-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isArchived).toBe(true);
    expect(isFolder[1].isArchived).toBe(true);

    expect(body).toMatchObject({
      status: true,
      message: 'Folder archived',
    });
  });
  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: [folderId],
    };

    const url = `/api/folder/archive-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isArchived).not.toBe(true);
    expect(isFolder[1].isArchived).not.toBe(true);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});

describe('PUT /api/folder/unarchive-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
      isArchived: true,
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
      isArchived: true,
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should archive a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: [folder._id, folderTwo._id],
    };

    const url = `/api/folder/unarchive-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isArchived).toBe(false);
    expect(isFolder[1].isArchived).toBe(false);

    expect(body).toMatchObject({
      status: true,
      message: 'Folder unarchived',
    });
  });
  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: [folderId],
    };

    const url = `/api/folder/unarchive-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isArchived).not.toBe(false);
    expect(isFolder[1].isArchived).not.toBe(false);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});

describe('PUT /api/folder/trash-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should thrash a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: [folder._id, folderTwo._id],
    };

    const url = `/api/folder/trash-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isTrashed).toBe(true);
    expect(isFolder[1].isTrashed).toBe(true);

    expect(body).toMatchObject({
      status: true,
      message: 'File trashed',
    });
  });
  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: [folderId],
    };

    const url = `/api/folder/trash-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isTrashed).toBe(false);
    expect(isFolder[1].isTrashed).toBe(false);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});

describe('PUT /api/folder/untrash-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
      isTrashed: true,
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
      isTrashed: true,
    });

    await createFolder({
      ...folderDataTwo,
      orgId: orgOne._id,
      isStarred: false,
      isTrashed: true,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should untrash a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: [folder._id, folderTwo._id],
    };

    const url = `/api/folder/untrash-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isTrashed).toBe(false);
    expect(isFolder[1].isTrashed).toBe(false);

    expect(body).toMatchObject({
      status: true,
      message: 'File untrashed',
    });
  });

  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: [folderId],
    };

    const url = `/api/folder/untrash-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isTrashed).toBe(true);
    expect(isFolder[1].isTrashed).toBe(true);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});

describe('PUT /api/folder/pin-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
      isPinned: false,
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
      isPinned: false,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should pin a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: folder._id,
    };

    const url = `/api/folder/pin-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isPinned).toBe(true);
    expect(isFolder[1].isPinned).toBe(false);

    expect(body).toMatchObject({
      status: true,
      message: 'Folder Pinned succesfuly',
    });
  });

  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: folderId,
    };

    const url = `/api/folder/pin-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isPinned).toBe(false);
    expect(isFolder[1].isPinned).toBe(false);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});

describe('PUT /api/folder/unpin-folder', () => {
  let userValueOne: any, userToken: any, orgOne: any, folder: any, folderTwo: any;
  beforeEach(async () => {
    orgOne = await organization.create(orgDataOne);
    userValueOne = await createUser(userOne);
    const userValueTwo = await createUser(userTwo);

    folder = await createFolder({
      ...folderDataOne,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folder',
      isPinned: true,
    });

    folderTwo = await createFolder({
      ...folderDataTwo,
      isStarred: false,
      orgId: orgOne._id,
      folderName: 'folders',
      isPinned: true,
    });

    const orgMemberOne = {
      orgId: orgOne._id,
      memberId: userOne._id,
      role: userRoles.admin,
      userName: faker.lorem.word(),
    };
    const orgMemberTwo = {
      orgId: orgOne._id,
      memberId: userTwo._id,
      role: userRoles.guest,
      userName: faker.lorem.word(),
    };

    await orgMembers.insertMany([orgMemberOne, orgMemberTwo]);

    userToken = await genToken({
      userId: userValueOne._id,
      email: userValueOne.email,
    });
  });

  afterEach(async () => {
    await deleteUsers();
    await deleteOrganization();
    await deleteFolder();
    await deleteOrgMember();
  });

  test('should unpin a folder', async () => {
    const payload = {
      orgId: orgOne.id,
      folderId: folder._id,
    };

    const url = `/api/folder/unpin-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.OK);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isPinned).toBe(false);
    expect(isFolder[1].isPinned).toBe(true);

    expect(body).toMatchObject({
      status: true,
      message: 'Folder unPinned succesfuly',
    });
  });

  test('should return an error if folderId is invalid', async () => {
    const folderId = faker.database.mongodbObjectId();

    const payload = {
      orgId: orgOne.id,
      folderId: folderId,
    };

    const url = `/api/folder/unpin-folder`;
    const { body } = await api
      .put(url)
      .set('Authorization', `Bearer ${userToken}`)
      .send(payload)
      .expect(httpStatus.NOT_FOUND);

    const isFolder = await Folder.find({});
    expect(isFolder[0].isPinned).toBe(true);
    expect(isFolder[1].isPinned).toBe(true);

    expect(body).toMatchObject({
      message: errorMessages.FOLDER_NOT_FOUND,
    });
  });
});
