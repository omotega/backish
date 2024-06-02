import express from "express";
import cron from "node-cron";
import route from "./routes";
import docRouter from "./docs";
import { CustomRequest } from "./types/customrequest.";
import folderservices from "./services/folderservices";
import fileservices from "./services/fileservices";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: "300mb", extended: true }));

declare global {
  namespace Express {
    interface Request extends CustomRequest {}
  }
}

app.get("/", (req, res) => {
  res.send("welcome to backish application");
});

app.use("/api", route);
app.use("/docs", docRouter);

app.use((req, res) =>
  res.status(404).send({
    status: "error",
    error: "Not found",
    message: "Route not correct kindly check url.",
  })
);

// Set up the cron job to run everyday
cron.schedule("0 0 * * *", async () => {
  try {
    const result = await folderservices.cleanupFolders();
    const res = await fileservices.cleanupFiles();

    console.log("Expired Files and Folders deleted successfully");
    return { result, res };
  } catch (error: any) {
    console.error(error.message);
  }
});

export default app;
