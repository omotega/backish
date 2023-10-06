import usercontroller from "../controller/usercontroller";
import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import userValidations from "../validation/uservalidation";

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
      validationMiddleware(userValidations.updateUserValidation),
      usercontroller.updateProfile
    );

export default userRouter;
