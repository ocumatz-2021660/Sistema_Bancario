'use strict';

import { Router } from 'express';
import { createTransaccion, getTransacciones, deleteTransaccion } from './transaction.controller.js';
import { validateTransactionInput, validateAccountsAndFunds } from '../../middlewares/transaction-validators.js';
import { canCancelTransaction } from '../../middlewares/time-out-transaction.js';
import { validateDailyLimit } from '../../middlewares/max-transaction-money.js';
import { getTransaccionesByCuenta } from './transaction.controller.js';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { isAccountOwnerTransaction } from '../../middlewares/is_account_owner.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transacciones
 *   description: Gestión de transferencias y depósitos entre cuentas
 */

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Crear una transacción (transferencia o depósito)
 *     description: >
 *       Crea una transferencia entre dos cuentas o un depósito a una cuenta destino.
 *       Para transferencias se requiere cuenta_origen. El destino puede ser un número
 *       de cuenta (10 dígitos) o un alias guardado en favoritos del usuario autenticado.
 *       Límite diario de Q10,000 por cuenta origen.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monto
 *               - tipo_transaccion
 *               - cuenta_destinatoria
 *             properties:
 *               monto:
 *                 type: number
 *                 example: 150
 *                 description: Monto a transferir, máximo Q2000 por transacción
 *               tipo_transaccion:
 *                 type: string
 *                 enum: [TRANSFERENCIA, DEPOSITO]
 *                 example: TRANSFERENCIA
 *               cuenta_origen:
 *                 type: string
 *                 example: "2608010997"
 *                 description: Número de cuenta origen (requerido solo en TRANSFERENCIA)
 *               cuenta_destinatoria:
 *                 type: string
 *                 example: "2491903918"
 *                 description: Número de cuenta destino de 10 dígitos, o alias de favorito
 *     responses:
 *       201:
 *         description: Transacción realizada exitosamente
 *       400:
 *         description: Fondos insuficientes, monto inválido o límite diario excedido
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No eres el propietario de la cuenta origen
 *       404:
 *         description: Cuenta origen o destinataria no encontrada, o alias no existe en favoritos
 */
router.post('/', validateJWT, isAccountOwnerTransaction, validateTransactionInput, validateAccountsAndFunds, validateDailyLimit, createTransaccion);

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Listar todas las transacciones (solo Admin)
 *     description: Retorna un listado paginado de todas las transacciones del sistema. Permite convertir montos a otra moneda.
 *     tags: [Transacciones]
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
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           example: USD
 *         description: Código de moneda para convertir los montos (ej. USD, EUR). Por defecto GTQ.
 *     responses:
 *       200:
 *         description: Listado de transacciones obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getTransacciones);

/**
 * @swagger
 * /transactions/account/{id_cuenta}:
 *   get:
 *     summary: Historial de transacciones de una cuenta (últimas 5)
 *     description: Retorna las últimas 5 transacciones donde la cuenta aparece como origen o destino. Envía el historial al correo del titular en PDF.
 *     tags: [Transacciones]
 *     parameters:
 *       - in: path
 *         name: id_cuenta
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la cuenta
 *         example: 664f1b2e8c4a2d001f3e9abc
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           example: USD
 *         description: Código de moneda para convertir los montos
 *     responses:
 *       200:
 *         description: Historial obtenido y PDF enviado al correo del titular
 *       404:
 *         description: Cuenta no encontrada o inactiva
 */
router.get('/account/:id_cuenta', getTransaccionesByCuenta);

/**
 * @swagger
 * /transactions/cancelar/{id}:
 *   delete:
 *     summary: Cancelar una transacción (solo Admin, máximo 1 minuto después)
 *     description: >
 *       Elimina la transacción y revierte los saldos a su estado anterior.
 *       Solo es posible si ha transcurrido menos de 1 minuto desde que se realizó.
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la transacción
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Transacción cancelada y saldos revertidos exitosamente
 *       400:
 *         description: El tiempo límite de 1 minuto ha expirado
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Transacción no encontrada
 */
router.delete('/cancelar/:id', validateJWT, isAdmin, canCancelTransaction, deleteTransaccion);

export default router;