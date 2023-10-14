import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import orgValidations from "../validation/orgvalidation";
import authGuard from "../midlewares/auth";
import organizationcontroller from "../controller/organizationcontroller";

const orgRouter = Router();

orgRouter
  .route("/getallusers")
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAllUserValidation),
    organizationcontroller.getAllUsersInOrganization
  );

orgRouter
  .route("/get-a-user")
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAUserValidation),
    organizationcontroller.getAUser
  )


export default orgRouter;
