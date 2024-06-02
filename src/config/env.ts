import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envVariables = z.object({
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform((value) => Number(value)),
  SMTP_PASSWORD: z.string(),
  SMTP_EMAIL: z.string(),
  REDIS_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  TEST_MONGO_URI: z.string(),
  PORT: z
    .string()
    .transform((value) => Number(value))
    .default('7777'),
});

let env = envVariables.parse(process.env);
export function validate(config: Record<string, unknown>) {
  try {
    const response = envVariables.parse(config);
    return response;
  } catch (error: any) {
    throw new Error(`Config validation error: ${JSON.stringify(error.issues)}`);
  }
}

const config = {
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
  jwtExpires: env.JWT_EXPIRES,
  smtpHost: env.SMTP_HOST,
  smtpPort: env.SMTP_PORT,
  smtpPassword: env.SMTP_PASSWORD,
  smtpEmail: env.SMTP_EMAIL,
  redisUrl: env.REDIS_URL,
  cloudinaryCloudName: env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: env.CLOUDINARY_API_SECRET,
  testMongoUri: env.TEST_MONGO_URI,
  port: env.PORT,
};

export default config;
