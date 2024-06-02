import mongoose from 'mongoose';
import config from '../config/env';

const testDB = () => {
  beforeAll(async () => {
    await mongoose.connect(config.testMongoUri);
  });

  beforeEach(async () => {
    // @ts-ignore
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
};

export default testDB;
