import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import folderValidation from "../validation/foldervalidation";
import authGuard from "../midlewares/auth";
import foldercontroller from "../controller/foldercontroller";

const folderRouter = Router();

folderRouter
  .route("/create-folder")
  .post(
    authGuard.guard,
    validationMiddleware(folderValidation.createFolderValidation),
    foldercontroller.createFolder
  );

folderRouter
  .route("/star-folder")
  .post(
    authGuard.guard,
    validationMiddleware(folderValidation.starFolderValidation),
    foldercontroller.starFolder
  );

folderRouter
  .route("/unstar-folder")
  .post(
    authGuard.guard,
    validationMiddleware(folderValidation.unstarFolderValidation),
    foldercontroller.unstarFolder
  );

folderRouter
  .route("/get-starred-folders")
  .get(
    authGuard.guard,
    validationMiddleware(folderValidation.liststarredFoldersValidation),
    foldercontroller.getAllStarredFolders
  );

folderRouter
  .route("/get-all-folders")
  .get(
    authGuard.guard,
    validationMiddleware(folderValidation.listAllFoldersValidation),
    foldercontroller.getAllFolders
  );

export default folderRouter;
