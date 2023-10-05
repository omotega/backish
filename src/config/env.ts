import dotenv from "dotenv";
dotenv.config();

const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGO_URI as string,
  tokenSecret: process.env.TOKEN_SECRET as string,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET
};

export default config;
