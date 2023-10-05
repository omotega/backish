import filecontroller from "../controller/filecontroller";
import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import filevalidation from "../validation/filevalidation";
import authGuard from "../midlewares/auth";

const fileRouter = Router();

fileRouter
  .route("/upload-request")
  .post(
    authGuard.guard,
    validationMiddleware(filevalidation.uploadRequest),
    filecontroller.requestFileUpload
  );

export default fileRouter;
