import express from "express";
import route from "./routes";
import docRouter from "./docs";
import { CustomRequest } from "./types/customrequest";
import fileUpload from "express-fileupload";


const app = express();

app.use(express.json());
app.use(express.urlencoded({ limit: "300mb", extended: true }));
// app.use(
//   fileUpload({
//     limits: { fileSize: 50 * 1024 * 1024 },
//   })
// );


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
