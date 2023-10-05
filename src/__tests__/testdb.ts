import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";


const dbConnect = async function () {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

const dbCleanUp = async () => {
  const mongoServer = await MongoMemoryServer.create();
  if (mongoServer) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
};

const dbDisconnect = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

export default {
  dbConnect,
  dbCleanUp,
  dbDisconnect,
};
