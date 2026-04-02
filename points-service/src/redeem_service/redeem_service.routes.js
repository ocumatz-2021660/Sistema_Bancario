import { Router } from 'express';
import { canjearServicio, getAllCanjes, getCanjesByCuenta, cancelarCanje } from './redeem_service.controller.js';
import { isAdmin } from '../../../account-service/middlewares/is.admin.js';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';
import { verificarPuntos } from '../../middlewares/redeem_service.validation.js';
import { canCancelCanje } from '../../middlewares/time-out-redeem_service.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Canjes
 *   description: Gestión de canje de puntos por servicios
 */

/**
 * @swagger
 * /redeem_services/redeem:
 *   post:
 *     summary: Canjear puntos por un servicio
 *     description: >
 *       Permite al usuario autenticado canjear sus puntos acumulados por un servicio disponible.
 *       Se verifica que la cuenta tenga puntos suficientes antes de realizar el canje.
 *     tags: [Canjes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cuenta_id
 *               - servicio_id
 *             properties:
 *               cuenta_id:
 *                 type: string
 *                 example: 664f1b2e8c4a2d001f3e9abc
 *                 description: ID de MongoDB de la cuenta con la que se realiza el canje
 *               servicio_id:
 *                 type: string
 *                 example: 664f1b2e8c4a2d001f3e9def
 *                 description: ID de MongoDB del servicio a canjear
 *     responses:
 *       201:
 *         description: Canje realizado exitosamente
 *       400:
 *         description: Puntos insuficientes para realizar el canje
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Cuenta o servicio no encontrado
 */
router.post('/redeem', validateJWT, verificarPuntos, canjearServicio);

/**
 * @swagger
 * /redeem_services/{cuenta_id}:
 *   get:
 *     summary: Historial de canjes de una cuenta
 *     description: Retorna todos los canjes realizados desde una cuenta específica.
 *     tags: [Canjes]
 *     parameters:
 *       - in: path
 *         name: cuenta_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la cuenta
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Historial de canjes obtenido exitosamente
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/:cuenta_id', getCanjesByCuenta);

/**
 * @swagger
 * /redeem_services:
 *   get:
 *     summary: Listar todos los canjes (solo Admin)
 *     description: Retorna un listado paginado de todos los canjes realizados en el sistema.
 *     tags: [Canjes]
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
 *         description: Listado de canjes obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getAllCanjes);

/**
 * @swagger
 * /redeem_services/cancel/{id}:
 *   delete:
 *     summary: Cancelar un canje
 *     description: >
 *       Cancela un canje y devuelve los puntos a la cuenta.
 *       Solo es posible dentro del tiempo límite permitido después de realizarlo.
 *     tags: [Canjes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del canje a cancelar
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Canje cancelado y puntos devueltos exitosamente
 *       400:
 *         description: El tiempo límite para cancelar ha expirado
 *       404:
 *         description: Canje no encontrado
 */
router.delete('/cancel/:id', canCancelCanje, cancelarCanje);

export default router;