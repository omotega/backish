import express from "express";
import route from "./routes";
import docRouter from "./docs";
import { CustomRequest } from "./types/customrequest";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

export default app;
