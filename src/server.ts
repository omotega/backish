import app from './app';
import http from 'http';
import connectDb from './database/dbconnection';
import { createHttpTerminator } from 'http-terminator';
import config from './config/env';

const port = config.port;
export const server = http.createServer(app);
export const httpTerminator = createHttpTerminator({
  server,
});

(async () => {
  console.log('Waiting for DATABASE Connection...');
  await connectDb();
  server.listen(port, () => {
    console.log(`Server connected on port ${port}`);
  });
})();

process.on('SIGINT', () => {
  console.log('Shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
