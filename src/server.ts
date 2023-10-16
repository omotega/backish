import app from "./app";
import http from "http";
import connectDb from "./database/dbconnection";
// import cache from "./cache/redis";
import { createHttpTerminator } from "http-terminator";
import config from "./config/env";

const port = config.PORT;
export const server = http.createServer(app);
export const httpTerminator = createHttpTerminator({
  server,
});

connectDb();
// cache.redisConnect();
server.listen(port, () => {
  console.log(`server connected on port ${port}`);
});
