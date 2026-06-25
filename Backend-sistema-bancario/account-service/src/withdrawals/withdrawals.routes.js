'use strict';

import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { isAccountOwnerWithdrawal } from '../../middlewares/is_account_owner.js';
import { validateWithdrawalInput, validateDailyLimit } from '../../middlewares/withdrawals-validation.js';
import { createRetiro, getRetiros, getRetirosByCuenta } from './withdrawals.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Retiros
 *   description: Gestión de retiros de cuentas bancarias
 */

/**
 * @swagger
 * /withdrawals:
 *   post:
 *     summary: Realizar un retiro
 *     description: Retira un monto de la cuenta del usuario autenticado. Solo el propietario de la cuenta puede realizar retiros.
 *     tags: [Retiros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - no_cuenta
 *               - monto
 *             properties:
 *               no_cuenta:
 *                 type: string
 *                 example: "2608010997"
 *                 description: Número de cuenta de 10 dígitos de donde se retira
 *               monto:
 *                 type: number
 *                 example: 200
 *                 description: Monto a retirar, debe ser mayor que 0
 *     responses:
 *       201:
 *         description: Retiro realizado exitosamente
 *       400:
 *         description: Monto inválido, fondos insuficientes o límite diario excedido
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No eres el propietario de la cuenta
 *       404:
 *         description: Cuenta no encontrada o inactiva
 */
router.post('/', validateJWT, isAccountOwnerWithdrawal, validateWithdrawalInput, validateDailyLimit, createRetiro);

/**
 * @swagger
 * /withdrawals:
 *   get:
 *     summary: Listar todos los retiros (solo Admin)
 *     description: Retorna un listado paginado de todos los retiros del sistema.
 *     tags: [Retiros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *     responses:
 *       200:
 *         description: Listado de retiros obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getRetiros);

/**
 * @swagger
 * /withdrawals/cuenta/{id_cuenta}:
 *   get:
 *     summary: Historial de retiros de una cuenta
 *     description: Retorna todos los retiros realizados desde una cuenta específica.
 *     tags: [Retiros]
 *     parameters:
 *       - in: path
 *         name: id_cuenta
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la cuenta
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Historial de retiros obtenido exitosamente
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/cuenta/:id_cuenta', getRetirosByCuenta);

export default router;