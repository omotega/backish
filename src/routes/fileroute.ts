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

fileRouter
  .route("/get-files-in-folder/:folderId/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(filevalidation.getAllFilesInFolderValidation),
    filecontroller.getAllFilesInFolder
  );

fileRouter
  .route("/move-files/:fileIds")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.moveFileValidation),
    filecontroller.moveFile
  );

fileRouter
  .route("/all-files/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(filevalidation.getAllFilesValidation),
    filecontroller.getAllFiles
  );

fileRouter
  .route("/star-file/:orgId/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.starFileValidation),
    filecontroller.starFile
  );

fileRouter
  .route("/unstar-file/:orgId/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.unstarFileValidation),
    filecontroller.unstarFile
  );

fileRouter
  .route("/archive-file/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.archiveValidation),
    filecontroller.archiveFile
  );

fileRouter
  .route("/unarchive-file/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.archiveValidation),
    filecontroller.unarchiveFile
  );

fileRouter
  .route("/trash-file/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.trashValidation),
    filecontroller.trashFiles
  );

fileRouter
  .route("/untrash-file/:fileId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.trashValidation),
    filecontroller.untrashFiles
  );

<<<<<<< HEAD
  fileRouter
  .route("/copy-file/")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.fileCopyValidation),
    filecontroller.copyFiles
  );

export default fileRouter;
=======
fileRouter
  .route("/rename-file/:fileId/:orgId")
  .patch(
    authGuard.guard,
    validationMiddleware(filevalidation.updateFilenameValidation),
    filecontroller.updateFileName
  );
>>>>>>> dffb0173a9b759ea4c71aa4b00ba3cc5b0c9da73

export default fileRouter;
