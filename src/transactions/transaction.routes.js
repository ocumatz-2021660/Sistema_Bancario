'use strict';
 
import { Router } from 'express';
import { createTransaccion,
        getTransacciones,
        deleteTransaccion,
 
} from './transaction.controller.js';
import { validateTransactionInput, validateAccountsAndFunds } from '../../middlewares/transaction-validators.js';
import { canCancelTransaction } from '../../middlewares/time-out-transaction.js';
import { validateDailyLimit } from '../../middlewares/max-transaction-money.js';
import { getTransaccionesByCuenta } from './transaction.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
 
const router = Router();
 
// Crear transacción (transferencia o depósito)
router.post('/', validateTransactionInput, validateAccountsAndFunds, validateDailyLimit, createTransaccion);
 
// Listar transacciones
router.get('/', validateJWT, isAdmin, getTransacciones);
 
// Historial por número de cuenta (últimas 5)
router.get('/account/:no_cuenta', getTransaccionesByCuenta);
 
//eliminar solo si a pasado 1 minuto (si se elimina se devuelve el dinero)
router.delete('/cancelar/:id', validateJWT, isAdmin,canCancelTransaction, deleteTransaccion);
 
export default router;
 