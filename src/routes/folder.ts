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
  .route("/get-starred-folders/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(folderValidation.liststarredFoldersValidation),
    foldercontroller.getAllStarredFolders
  );

folderRouter
  .route("/get-all-folders/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(folderValidation.listAllFoldersValidation),
    foldercontroller.getAllFolders
  );
folderRouter
  .route("/get-unstarred-folders/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(folderValidation.listUnstarredFoldersValidation),
    foldercontroller.getAllUnstarredFolders
  );

folderRouter
  .route("/:folderId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.updateFolderValidation),
    foldercontroller.updateFolder
  );

folderRouter
  .route("/add-folderaccess")
  .post(
    authGuard.guard,
    validationMiddleware(folderValidation.folderAccessValidation),
    foldercontroller.folderAccess
  );

folderRouter
  .route("/org/:orgId/delete-folder/:folderId")
  .delete(authGuard.guard, foldercontroller.deleteFolder);

folderRouter
  .route("/org/:orgId/archive-folder/:folderId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.folderArchiveValidation),
    foldercontroller.folderArchive
  );

folderRouter
  .route("/org/:orgId/unarchive-folder/:folderId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.folderUnarchiveValidation),
    foldercontroller.folderUnarchive
  );

  folderRouter
  .route("/trash-folder/:folderId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.trashValidation),
    foldercontroller.folderTrash
  );

folderRouter
  .route("/untrash-folder/:folderId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.trashValidation),
    foldercontroller.folderunTrash
  );

  folderRouter
  .route("/copy-folder")
  .post(
    authGuard.guard,
    validationMiddleware(folderValidation.folderCopyValidation),
    foldercontroller.folderCopy
  );


  folderRouter
  .route("/remove-folderaccess/:orgId/:folderId/:collaboratorId")
  .patch(
    authGuard.guard,
    validationMiddleware(folderValidation.removeFolderAccessValidation),
    foldercontroller.removefolderAccess
  );
export default folderRouter;



