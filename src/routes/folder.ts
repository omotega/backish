import { Router } from 'express';
import validationMiddleware from '../midlewares/validation';
import folderValidation from '../validation/foldervalidation';
import authGuard from '../midlewares/auth';
import foldercontroller from '../controller/foldercontroller';

const folderRouter = Router();

folderRouter.post(
  '/:orgId/create-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.createFolderValidation),
  foldercontroller.createFolder
);

folderRouter.post(
  '/star-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.starFolderValidation),
  foldercontroller.starFolder
);

folderRouter.post(
  '/unstar-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.unstarFolderValidation),
  foldercontroller.unstarFolder
);

folderRouter.get(
  '/starred-folders',
  authGuard.guard,
  validationMiddleware(folderValidation.liststarredFoldersValidation),
  foldercontroller.getAllStarredFolders
);

folderRouter.get(
  '/folders',
  authGuard.guard,
  validationMiddleware(folderValidation.listAllFoldersValidation),
  foldercontroller.getAllFolders
);

folderRouter.get(
  '/unstarred-folders',
  authGuard.guard,
  validationMiddleware(folderValidation.listUnstarredFoldersValidation),
  foldercontroller.getAllUnstarredFolders
);

folderRouter.put(
  '/:folderId/update-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.updateFolderValidation),
  foldercontroller.updateFolder
);

folderRouter.put(
  '/:folderId/add-folder-access',
  authGuard.guard,
  validationMiddleware(folderValidation.folderAccessValidation),
  foldercontroller.folderAccess
);

folderRouter.delete(
  '/delete-folder/:folderId',
  authGuard.guard,
  foldercontroller.deleteFolder
);

folderRouter.put(
  '/archive-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.folderArchiveValidation),
  foldercontroller.folderArchive
);

folderRouter.put(
  '/unarchive-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.folderUnarchiveValidation),
  foldercontroller.folderUnarchive
);

folderRouter.put(
  '/trash-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.trashFolderValidation),
  foldercontroller.folderTrash
);

folderRouter.put(
  '/untrash-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.unTrashFolderValidation),
  foldercontroller.untrashFolder
);

folderRouter
  .route('/copy-folder')
  .put(
    authGuard.guard,
    validationMiddleware(folderValidation.folderCopyValidation),
    foldercontroller.folderCopy
  );

folderRouter.put(
  '/remove-folderaccess',
  authGuard.guard,
  validationMiddleware(folderValidation.removeFolderAccessValidation),
  foldercontroller.removefolderAccess
);

folderRouter.put(
  '/moveFolder',
  authGuard.guard,
  validationMiddleware(folderValidation.moveFolderAccessValidation),
  foldercontroller.moveFolder
);

folderRouter.put(
  '/pin-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.pinFolderValidation),
  foldercontroller.pinFolder
);

folderRouter.put(
  '/unpin-folder',
  authGuard.guard,
  validationMiddleware(folderValidation.unpinFolderValidation),
  foldercontroller.unpinFolder
);

export default folderRouter;
