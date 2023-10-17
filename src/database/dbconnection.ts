import dotenv from "dotenv";
import mongoose from "mongoose";
import config from "../config/env";

dotenv.config();

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`db connected at ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

connectDb();

export default connectDb;
