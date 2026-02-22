import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
} from './user.controller.js';
import {
  updateAccountStatus,
  getAccountStatus,
} from './account-status.controller.js';

const router = Router();

router.put('/:userId/role', validateJWT, isAdmin, updateUserRole);
router.get('/:userId/roles', validateJWT, getUserRoles);
router.get('/by-role/:roleName', validateJWT, isAdmin, getUsersByRole);

//ver estados de cuenta (verificar cuentas a futuro)
router.put('/:userId/status', validateJWT, isAdmin, updateAccountStatus);
router.get('/:userId/status', validateJWT, isAdmin, getAccountStatus);

export default router;