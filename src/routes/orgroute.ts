import { Router } from 'express';
import validationMiddleware from '../midlewares/validation';
import orgValidations from '../validation/orgvalidation';
import authGuard from '../midlewares/auth';
import organizationcontroller from '../controller/organizationcontroller';

const orgRouter = Router();

orgRouter.get(
  '/org-users',
  authGuard.guard,
  validationMiddleware(orgValidations.getAllUserValidation),
  organizationcontroller.getAllUsersInOrganization
);

orgRouter.get(
  '/get-a-user/',
  authGuard.guard,
  validationMiddleware(orgValidations.getAUserValidation),
  organizationcontroller.getAUser
);

orgRouter.put(
  '/leave-org/:orgId',
  authGuard.guard,
  validationMiddleware(orgValidations.leaveOrgUserValidation),
  organizationcontroller.signOutOfOrg
);

orgRouter.get(
  '/userorgs',
  authGuard.guard,
  validationMiddleware(orgValidations.getAllUserOrgsValidation),
  organizationcontroller.getAllUserOrgs
);

orgRouter.put(
  '/update-user-role',
  authGuard.guard,
  validationMiddleware(orgValidations.upadateUserroleValidation),
  organizationcontroller.changeUserRole
);

orgRouter.put(
  '/deactivate-user',
  authGuard.guard,
  validationMiddleware(orgValidations.removeUserFromOrgValidation),
  organizationcontroller.deactivateUserFromOrg
);

export default orgRouter;
