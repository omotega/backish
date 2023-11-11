import filecontroller from "../controller/filecontroller";
import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import filevalidation from "../validation/filevalidation";
import authGuard from "../midlewares/auth";
import upload from "../midlewares/upload";

const fileRouter = Router();

fileRouter
  .route("/upload-file")
  .post(
    authGuard.guard,
    upload.array("file"),
    validationMiddleware(filevalidation.fileUploadValidation),
    filecontroller.fileUpload
  );

fileRouter
  .route("/add-to-folder/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.addFileToFolderValidation),
    filecontroller.addFileToFolder
  );

fileRouter.route("/get-files-in-folder/:folderId/:orgId").get(
  authGuard.guard,
  validationMiddleware(filevalidation.getAllFilesInFolderValidation),
  filecontroller.getAllFilesInFolder
);

export default fileRouter;
