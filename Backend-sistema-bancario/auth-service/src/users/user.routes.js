import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../../account-service/middlewares/is.admin.js';
import {
  updateUserRole,
  getUserRoles,
  getUsersByRole,
  getUsers,
  updateUser,
  deleteUser,
} from './user.controller.js';
import {
  updateAccountStatus,
  getAccountStatus,
} from './account-status.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios y roles
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Obtener todos los usuarios (solo Admin)
 *     description: Retorna un listado de todos los usuarios registrados en el sistema.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 10
 *         description: Cantidad de resultados por página
 *     responses:
 *       200:
 *         description: Listado de usuarios obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.get('/', validateJWT, isAdmin, getUsers);

/**
 * @swagger
 * /usuarios/{userId}:
 *   put:
 *     summary: Actualizar datos de un usuario (solo Admin)
 *     description: Permite actualizar la información de un usuario específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: usr_8dgjEaBFTePn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan.perez@correo.com
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:userId', validateJWT, isAdmin, updateUser);

/**
 * @swagger
 * /usuarios/{userId}:
 *   delete:
 *     summary: Eliminar un usuario (solo Admin)
 *     description: Elimina permanentemente un usuario, su perfil, cuentas, solicitudes y favoritos. Las transacciones y canjes se conservan.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *         example: usr_8dgjEaBFTePn
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No tienes permisos o el usuario está protegido
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:userId', validateJWT, isAdmin, deleteUser);

/**
 * @swagger
 * /usuarios/{userId}/role:
 *   put:
 *     summary: Actualizar el rol de un usuario (solo Admin)
 *     description: Asigna o cambia el rol de un usuario específico dentro del sistema.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: usr_8dgjEaBFTePn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 example: ADMIN
 *                 description: Nuevo rol a asignar al usuario
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *       400:
 *         description: Rol inválido o datos incorrectos
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:userId/role', validateJWT, isAdmin, updateUserRole);

/**
 * @swagger
 * /usuarios/{userId}/roles:
 *   get:
 *     summary: Obtener los roles de un usuario
 *     description: Retorna todos los roles asignados a un usuario específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: usr_8dgjEaBFTePn
 *     responses:
 *       200:
 *         description: Roles del usuario obtenidos exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:userId/roles', validateJWT, getUserRoles);

/**
 * @swagger
 * /usuarios/by-role/{roleName}:
 *   get:
 *     summary: Obtener usuarios por rol (solo Admin)
 *     description: Retorna todos los usuarios que tienen asignado un rol específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleName
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *         description: Nombre del rol a filtrar
 *         example: ADMIN
 *     responses:
 *       200:
 *         description: Listado de usuarios con el rol especificado
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Rol no encontrado
 */
router.get('/by-role/:roleName', validateJWT, isAdmin, getUsersByRole);

/**
 * @swagger
 * /usuarios/{userId}/status:
 *   put:
 *     summary: Actualizar el estado de la cuenta de un usuario (solo Admin)
 *     description: Permite activar o desactivar la cuenta de un usuario específico.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: usr_8dgjEaBFTePn
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isActive
 *             properties:
 *               isActive:
 *                 type: boolean
 *                 example: true
 *                 description: Estado de la cuenta del usuario
 *     responses:
 *       200:
 *         description: Estado de la cuenta actualizado exitosamente
 *       400:
 *         description: La cuenta ya se encuentra en el estado indicado
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:userId/status', validateJWT, isAdmin, updateAccountStatus);

/**
 * @swagger
 * /usuarios/{userId}/status:
 *   get:
 *     summary: Obtener el estado de la cuenta de un usuario (solo Admin)
 *     description: Retorna el estado actual (activo/inactivo) de la cuenta de un usuario.
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: usr_8dgjEaBFTePn
 *     responses:
 *       200:
 *         description: Estado de la cuenta obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:userId/status', validateJWT, isAdmin, getAccountStatus);

export default router;