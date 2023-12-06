import { createClient } from "redis";
import config from "../config/env";

const redisURL = `redis://localhost:6379`;

const client = createClient({ url: redisURL });

client.on("connect", () => console.log("Cache is connecting"));
client.on("ready", () => console.log("Cache is ready"));
client.on("end", () => console.log("Cache disconnected"));
client.on("reconnecting", () => console.log("Cache is reconnecting"));
client.on("error", (e) => console.log(e));

const redisConnect = async () => {
  await client.connect();
};

// If the Node process ends, close the Cache connection
process.on("SIGINT", async () => {
  await client.disconnect();
});

export default {
  redisConnect,
  client,
};
