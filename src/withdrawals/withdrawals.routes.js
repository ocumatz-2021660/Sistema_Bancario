'use strict';

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { isAccountOwnerWithdrawal } from '../../middlewares/is_account_owner.js';
import { validateWithdrawalInput } from '../../middlewares/withdrawals-validation.js';
import {
  createRetiro,
  getRetiros,
  getRetirosByCuenta,
} from './withdrawals.controller.js';

const router = Router();
router.post('/', validateJWT, isAccountOwnerWithdrawal, validateWithdrawalInput, createRetiro);

// Listar todos los retiros (solo admin)
router.get('/', validateJWT, isAdmin, getRetiros);

// Historial de retiros de una cuenta
router.get('/cuenta/:id_cuenta', getRetirosByCuenta);

export default router;