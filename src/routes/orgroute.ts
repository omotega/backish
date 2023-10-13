import { Router } from "express";
import validationMiddleware from "../midlewares/validation";
import orgValidations from "../validation/orgvalidation";
import authGuard from "../midlewares/auth";
import organizationcontroller from "../controller/organizationcontroller";

const orgRouter = Router();

orgRouter
  .route("/getallusers")
  .get(
    validationMiddleware(orgValidations.getAllUserValidation),
    organizationcontroller.getAllUsersInOrganization
  );

orgRouter
  .route("/leave-org")
  .post(
    authGuard.guard,
    validationMiddleware(orgValidations.leaveOrgUserValidation),
    organizationcontroller.signOutOfOrg
  );

export default orgRouter;
