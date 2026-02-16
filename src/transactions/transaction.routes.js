'use strict';

import { Router } from 'express';
import { createTransaccion, getTransacciones } from './transaction.controller.js';
import { validateTransactionInput, validateAccountsAndFunds } from '../../middlewares/transaction-validators.js';
import { getTransaccionesByCuenta } from './transaction.controller.js';

const router = Router();

// Crear transacción (transferencia o depósito)
router.post('/', validateTransactionInput, validateAccountsAndFunds, createTransaccion);

// Listar transacciones
router.get('/', getTransacciones);

// Historial por número de cuenta (últimas 5)
router.get('/account/:no_cuenta', getTransaccionesByCuenta);

export default router;
