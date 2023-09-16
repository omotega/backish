import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI as string,
  tokenSecret: process.env.TOKEN_SECRET as string,
};

export default config;
