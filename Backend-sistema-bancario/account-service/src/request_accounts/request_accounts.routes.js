import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/is.admin.js';
import { getSolicitudes, getSolicitudById, aprobarSolicitud, rechazarSolicitud } from './request_accounts.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes de apertura de cuentas bancarias
 */

/**
 * @swagger
 * /request_accounts:
 *   get:
 *     summary: Listar todas las solicitudes (solo Admin)
 *     description: Retorna todas las solicitudes de apertura de cuenta, incluyendo las pendientes, aprobadas y rechazadas.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de solicitudes obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getSolicitudes);

/**
 * @swagger
 * /request_accounts/{id}:
 *   get:
 *     summary: Obtener una solicitud por ID (solo Admin)
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la solicitud
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Solicitud encontrada exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id', validateJWT, isAdmin, getSolicitudById);

/**
 * @swagger
 * /request_accounts/{id}/aprobar:
 *   put:
 *     summary: Aprobar una solicitud de cuenta (solo Admin)
 *     description: Aprueba la solicitud y activa la cuenta bancaria asociada.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la solicitud
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Solicitud aprobada y cuenta activada exitosamente
 *       400:
 *         description: La solicitud ya fue procesada anteriormente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id/aprobar', validateJWT, isAdmin, aprobarSolicitud);

/**
 * @swagger
 * /request_accounts/{id}/rechazar:
 *   put:
 *     summary: Rechazar una solicitud de cuenta (solo Admin)
 *     description: Rechaza la solicitud y mantiene la cuenta bancaria inactiva.
 *     tags: [Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la solicitud
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Solicitud rechazada exitosamente
 *       400:
 *         description: La solicitud ya fue procesada anteriormente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Solicitud no encontrada
 */
router.put('/:id/rechazar', validateJWT, isAdmin, rechazarSolicitud);

export default router;