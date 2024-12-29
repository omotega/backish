import usercontroller from '../controller/usercontroller';
import { Router } from 'express';
import validationMiddleware from '../midlewares/validation';
import userValidations from '../validation/uservalidation';
import authGuard from '../midlewares/auth';

const userRouter = Router();

userRouter.post(
  '/signup',
  validationMiddleware(userValidations.createUserValidation),
  usercontroller.signUp
);

userRouter.post(
  '/login',
  validationMiddleware(userValidations.loginUserValidation),
  usercontroller.login
);

userRouter.put(
  '/update-profile',
  authGuard.guard,
  validationMiddleware(userValidations.updateUserValidation),
  usercontroller.updateUser
);

userRouter.post(
  '/invite-user',
  authGuard.guard,
  validationMiddleware(userValidations.inviteUserValidation),
  usercontroller.inviteUser
);

userRouter.post(
  '/confirm-invite',
  validationMiddleware(userValidations.confirmInviteValidation),
  usercontroller.confirmInvite
);

userRouter.put(
  '/recover-account',
  validationMiddleware(userValidations.recoverAccountValidation),
  usercontroller.recover
);

userRouter.put(
  '/reset-password',
  validationMiddleware(userValidations.passwordResetValidation),
  usercontroller.passwordReset
);

export default userRouter;
