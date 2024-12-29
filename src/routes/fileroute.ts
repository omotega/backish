import filecontroller from '../controller/filecontroller';
import { Router } from 'express';
import validationMiddleware from '../midlewares/validation';
import filevalidation from '../validation/filevalidation';
import authGuard from '../midlewares/auth';
import upload from '../midlewares/upload';

const fileRouter = Router();

fileRouter.post(
  '/upload-file',
  authGuard.guard,
  upload.array('file'),
  validationMiddleware(filevalidation.fileUploadValidation),
  filecontroller.fileUpload
);

fileRouter.put(
  '/:fileId/add-to-folder',
  authGuard.guard,
  validationMiddleware(filevalidation.addFileToFolderValidation),
  filecontroller.addFileToFolder
);

fileRouter.get(
  '/:folderId/get-files-in-folder/:orgId',
  authGuard.guard,
  validationMiddleware(filevalidation.getAllFilesInFolderValidation),
  filecontroller.getAllFilesInFolder
);

fileRouter.put(
  '/:fileIds/move-files',
  authGuard.guard,
  validationMiddleware(filevalidation.moveFileValidation),
  filecontroller.moveFile
);

fileRouter.get(
  '/:orgId/all-files',
  authGuard.guard,
  validationMiddleware(filevalidation.getAllFilesValidation),
  filecontroller.getAllFiles
);

fileRouter.put(
  '/:fileId/star-file/:orgId',
  authGuard.guard,
  validationMiddleware(filevalidation.starFileValidation),
  filecontroller.starFile
);

fileRouter.put(
  '/:fileId/unstar-file/:orgId',
  authGuard.guard,
  validationMiddleware(filevalidation.unstarFileValidation),
  filecontroller.unstarFile
);

fileRouter.put(
  '/:fileId/archive-file',
  authGuard.guard,
  validationMiddleware(filevalidation.archiveValidation),
  filecontroller.archiveFile
);

fileRouter.put(
  '/:fileId/unarchive-file',
  authGuard.guard,
  validationMiddleware(filevalidation.archiveValidation),
  filecontroller.unarchiveFile
);

fileRouter.put(
  '/:fileId/trash-file',
  authGuard.guard,
  validationMiddleware(filevalidation.trashValidation),
  filecontroller.trashFiles
);

fileRouter.put(
  '/:fileId/untrash-file',
  authGuard.guard,
  validationMiddleware(filevalidation.trashValidation),
  filecontroller.untrashFiles
);

fileRouter.put(
  '/copy-file',
  authGuard.guard,
  validationMiddleware(filevalidation.fileCopyValidation),
  filecontroller.copyFiles
);

fileRouter.put(
  '/:fileId/rename-file/:orgId',
  authGuard.guard,
  validationMiddleware(filevalidation.updateFilenameValidation),
  filecontroller.updateFileName
);

fileRouter.get(
  '/get-thrashed-files',
  authGuard.guard,
  validationMiddleware(filevalidation.getTrashedFilesValidation),
  filecontroller.getAllThrashedFiles
);

fileRouter.put(
  '/lock-file',
  authGuard.guard,
  validationMiddleware(filevalidation.lockFileValidation),
  filecontroller.lockFile
);

fileRouter.put(
  '/reset-file-password',
  authGuard.guard,
  validationMiddleware(filevalidation.resetFilePasswordValidation),
  filecontroller.resetFilePassword
);

fileRouter.post(
  '/sort-files',
  authGuard.guard,
  validationMiddleware(filevalidation.sortFilePasswordValidation),
  filecontroller.sortedFile
);

export default fileRouter;
