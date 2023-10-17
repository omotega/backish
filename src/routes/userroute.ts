import usercontroller from "../controller/usercontroller";
import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import userValidations from "../validation/uservalidation";
import authGuard from "../midlewares/auth";

const userRouter = Router();

userRouter
  .route("/signup")
  .post(
    validationMiddleware(userValidations.createUserValidation),
    usercontroller.signUp
  );

userRouter
  .route("/login")
  .post(
    validationMiddleware(userValidations.loginUserValidation),
    usercontroller.login
  );

userRouter
  .route("/update-profile")
  .put(
    authGuard.guard,
    validationMiddleware(userValidations.updateUserValidation),
    usercontroller.updateUser
  );

userRouter
  .route("/invite-user")
  .post(
    authGuard.guard,
    validationMiddleware(userValidations.inviteUserValidation),
    usercontroller.inviteUser
  );

userRouter
  .route("/confirm-invite")
  .post(
    validationMiddleware(userValidations.confirmInviteValidation),
    usercontroller.confirmInvite
  );

userRouter
  .route("/recover-account")
  .patch(
    validationMiddleware(userValidations.recoverAccountValidation),
    usercontroller.recover
  );

userRouter
  .route("/reset-password")
  .patch(
    validationMiddleware(userValidations.passwordResetValidation),
    usercontroller.passwordReset
  );

export default userRouter;
