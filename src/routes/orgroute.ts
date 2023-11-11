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
  .route("/get-a-user/:orgId")
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAUserValidation),
    organizationcontroller.getAUser
  );

orgRouter
  .route("/leave-org")
  .post(
    authGuard.guard,
    validationMiddleware(orgValidations.leaveOrgUserValidation),
    organizationcontroller.signOutOfOrg
  );

orgRouter
  .route("/get-all-userorgs")
  .get(authGuard.guard, organizationcontroller.getAllUserOrgs);

orgRouter
  .route("/update-user-role")
  .put(
    authGuard.guard,
    validationMiddleware(orgValidations.upadateUserroleValidation),
    organizationcontroller.changeUserRole
  );

export default orgRouter;
