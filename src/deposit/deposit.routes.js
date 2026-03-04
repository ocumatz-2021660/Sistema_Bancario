'use strict';

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { validateDepositInput,
    validateDailyDepositLimit,
 } from '../../middlewares/deposit-validation.js';
import {
  createDeposito,
  getDepositos,
  getDepositosByCuenta,
} from './deposit.controller.js';

const router = Router();

router.post('/', validateJWT, validateDepositInput, validateDailyDepositLimit, createDeposito);
router.get('/', validateJWT, isAdmin, getDepositos);
router.get('/cuenta/:id_cuenta', getDepositosByCuenta);

export default router;