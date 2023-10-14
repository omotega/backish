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

export default folderRouter;
