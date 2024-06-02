import { Router } from 'express';
import validationMiddleware from '../midlewares/validation';
import orgValidations from '../validation/orgvalidation';
import authGuard from '../midlewares/auth';
import organizationcontroller from '../controller/organizationcontroller';

const orgRouter = Router();

orgRouter
  .route('/org-users')
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAllUserValidation),
    organizationcontroller.getAllUsersInOrganization
  );

orgRouter
  .route('/get-a-user/')
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAUserValidation),
    organizationcontroller.getAUser
  );

orgRouter
  .route('/leave-org/:orgId')
  .put(
    authGuard.guard,
    validationMiddleware(orgValidations.leaveOrgUserValidation),
    organizationcontroller.signOutOfOrg
  );

orgRouter
  .route('/userorgs')
  .get(
    authGuard.guard,
    validationMiddleware(orgValidations.getAllUserOrgsValidation),
    organizationcontroller.getAllUserOrgs
  );

orgRouter
  .route('/update-user-role')
  .put(
    authGuard.guard,
    validationMiddleware(orgValidations.upadateUserroleValidation),
    organizationcontroller.changeUserRole
  );

orgRouter
  .route('/deactivate-user')
  .put(
    authGuard.guard,
    validationMiddleware(orgValidations.removeUserFromOrgValidation),
    organizationcontroller.deactivateUserFromOrg
  );

export default orgRouter;
