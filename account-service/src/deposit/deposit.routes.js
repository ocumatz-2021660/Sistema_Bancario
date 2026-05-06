'use strict';

import { Router } from 'express';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { validateDepositInput, validateDailyDepositLimit } from '../../middlewares/deposit-validation.js';
import { createDeposito, getDepositos, getDepositosByCuenta } from './deposit.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Depósitos
 *   description: Gestión de depósitos externos a cuentas bancarias
 */

/**
 * @swagger
 * /deposits:
 *   post:
 *     summary: Realizar un depósito externo
 *     description: Deposita dinero desde una fuente externa a una cuenta destino. No requiere cuenta origen.
 *     tags: [Depósitos]
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
 *                 example: "2491903918"
 *                 description: Número de cuenta destino de 10 dígitos
 *               monto:
 *                 type: number
 *                 example: 500
 *                 description: Monto a depositar, debe ser mayor que 0
 *     responses:
 *       201:
 *         description: Depósito realizado exitosamente
 *       400:
 *         description: Monto inválido o límite diario de depósitos excedido
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Cuenta destino no encontrada o inactiva
 */
router.post('/', validateJWT, validateDepositInput, validateDailyDepositLimit, createDeposito);

/**
 * @swagger
 * /deposits:
 *   get:
 *     summary: Listar todos los depósitos (solo Admin)
 *     description: Retorna un listado paginado de todos los depósitos del sistema.
 *     tags: [Depósitos]
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
 *         description: Listado de depósitos obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getDepositos);

/**
 * @swagger
 * /deposits/cuenta/{id_cuenta}:
 *   get:
 *     summary: Historial de depósitos de una cuenta
 *     description: Retorna todos los depósitos recibidos por una cuenta específica.
 *     tags: [Depósitos]
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
 *         description: Historial de depósitos obtenido exitosamente
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/cuenta/:id_cuenta', getDepositosByCuenta);

export default router;