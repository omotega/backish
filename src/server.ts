import app from "./app";
import http from 'http';
import config from "./config/env";
import connectDb from "./database/dbconnection";
import { createHttpTerminator } from "http-terminator";

const port = config.port
export const server = http.createServer(app)
export const httpTerminator = createHttpTerminator({
    server,
  });

connectDb()
server.listen(port,() => {
    console.log(`server connected on port ${port}`)
})


