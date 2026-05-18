import { Router } from "express";
import { validateAccountInput } from "../../middlewares/account-validation.js";
import { validateJWT } from "../../../auth-service/middlewares/validate-JWT.js";
import { isAdmin } from "../../middlewares/is.admin.js";
import {
    createCuenta,
    getCuentas,
    getCuentaById,
    getCuentasByUsuario,
    getFavoritos,
    updateSaldo,
    deleteCuenta,
    hardDeleteCuenta,
    activateCuenta,
} from "./account.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cuentas
 *   description: Gestión de cuentas bancarias
 */

/**
 * @swagger
 * /cuentas/create:
 *   post:
 *     summary: Crear una nueva cuenta bancaria
 *     description: Crea una cuenta INACTIVA para el usuario autenticado. Genera automáticamente una solicitud pendiente de aprobación por un administrador.
 *     tags: [Cuentas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo_cuenta
 *             properties:
 *               tipo_cuenta:
 *                 type: string
 *                 enum: [AHORRO, MONETARIA]
 *                 example: AHORRO
 *               saldo:
 *                 type: number
 *                 example: 500
 *                 description: Saldo inicial, mínimo 100Q. Si no se envía se asigna 100 por defecto.
 *               alias:
 *                 type: string
 *                 example: Mi cuenta de ahorros
 *                 description: Nombre opcional para identificar la cuenta como favorito
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente, pendiente de aprobación
 *       400:
 *         description: Saldo mínimo no cumplido o datos inválidos
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El usuario ya tiene una cuenta del mismo tipo
 */
router.post('/create', validateJWT, validateAccountInput, createCuenta);

/**
 * @swagger
 * /cuentas:
 *   get:
 *     summary: Obtener todas las cuentas (solo Admin)
 *     description: Retorna un listado paginado de todas las cuentas. Permite filtrar por tipo y estado.
 *     tags: [Cuentas]
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
 *         name: tipo_cuenta
 *         schema:
 *           type: string
 *           enum: [AHORRO, MONETARIA]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Listado de cuentas obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getCuentas);

/**
 * @swagger
 * /cuentas/buscar/favoritos:
 *   get:
 *     summary: Obtener cuentas marcadas como favoritas
 *     description: Retorna cuentas activas que tienen alias asignado. Permite buscar por alias.
 *     tags: [Cuentas]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por alias específico
 *         example: cuenta principal
 *     responses:
 *       200:
 *         description: Listado de favoritos obtenido
 */
router.get('/buscar/favoritos', getFavoritos);

/**
 * @swagger
 * /cuentas/usuario/{usuario_id}:
 *   get:
 *     summary: Obtener cuentas de un usuario específico
 *     tags: [Cuentas]
 *     parameters:
 *       - in: path
 *         name: usuario_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario en PostgreSQL
 *         example: usr_8dgjEaBFTePn
 *     responses:
 *       200:
 *         description: Cuentas del usuario obtenidas exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuario/:usuario_id', getCuentasByUsuario);

/**
 * @swagger
 * /cuentas/{id}:
 *   get:
 *     summary: Obtener una cuenta por su ID de MongoDB
 *     tags: [Cuentas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la cuenta
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Cuenta encontrada
 *       404:
 *         description: Cuenta no encontrada
 */
router.get('/:id', getCuentaById);

/**
 * @swagger
 * /cuentas/{id}/saldo:
 *   put:
 *     summary: Actualizar el saldo de una cuenta (solo Admin)
 *     tags: [Cuentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la cuenta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saldo
 *             properties:
 *               saldo:
 *                 type: number
 *                 example: 1500
 *                 description: Nuevo saldo, mínimo 100Q
 *     responses:
 *       200:
 *         description: Saldo actualizado exitosamente
 *       400:
 *         description: Saldo inválido o cuenta inactiva
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Cuenta no encontrada
 */
router.put('/:id/saldo', validateJWT, isAdmin, updateSaldo);

/**
 * @swagger
 * /cuentas/{id}/desactivate:
 *   put:
 *     summary: Desactivar una cuenta (solo Admin)
 *     description: Realiza un soft delete, cambia isActive a false sin eliminar el registro.
 *     tags: [Cuentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta desactivada exitosamente
 *       400:
 *         description: La cuenta ya estaba desactivada
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Cuenta no encontrada
 */
router.put('/:id/desactivate', validateJWT, isAdmin, deleteCuenta);

/**
 * @swagger
 * /cuentas/{id}/activate:
 *   put:
 *     summary: Activar una cuenta (solo Admin)
 *     tags: [Cuentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta activada exitosamente
 *       400:
 *         description: La cuenta ya estaba activa
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Cuenta no encontrada
 */
router.put('/:id/activate', validateJWT, isAdmin, activateCuenta);

/**
 * @swagger
 * /cuentas/{id}/delete:
 *   delete:
 *     summary: Eliminar permanentemente una cuenta (solo Admin)
 *     description: Elimina físicamente la cuenta y todas sus solicitudes asociadas de la base de datos.
 *     tags: [Cuentas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta y solicitudes eliminadas permanentemente
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Cuenta no encontrada
 */
router.delete('/:id/delete', validateJWT, isAdmin, hardDeleteCuenta);

export default router;