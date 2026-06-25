import { Router } from 'express';
import { createService, getServices, updateService, deleteService } from './service.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { isAdmin } from '../../middlewares/isAdmin.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Servicios
 *   description: Gestión del catálogo de servicios canjeables por puntos
 */

/**
 * @swagger
 * /services/create:
 *   post:
 *     summary: Crear un nuevo servicio (solo Admin)
 *     description: Agrega un nuevo servicio al catálogo disponible para canjear con puntos.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - puntos_requeridos
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Bono de combustible
 *                 description: Nombre del servicio
 *               descripcion:
 *                 type: string
 *                 example: Vale de Q50 en combustible
 *                 description: Descripción opcional del servicio
 *               puntos_requeridos:
 *                 type: number
 *                 example: 500
 *                 description: Cantidad de puntos necesarios para canjear este servicio
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 */
router.post('/create', validateJWT, isAdmin, createService);

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Listar todos los servicios disponibles
 *     description: Retorna el catálogo completo de servicios canjeables. No requiere autenticación.
 *     tags: [Servicios]
 *     responses:
 *       200:
 *         description: Catálogo de servicios obtenido exitosamente
 */
router.get('/', getServices);

/**
 * @swagger
 * /services/update/{id}:
 *   put:
 *     summary: Actualizar un servicio (solo Admin)
 *     description: Modifica los datos de un servicio existente en el catálogo.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del servicio
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Bono de supermercado
 *               descripcion:
 *                 type: string
 *                 example: Vale de Q100 en supermercado
 *               puntos_requeridos:
 *                 type: number
 *                 example: 800
 *     responses:
 *       200:
 *         description: Servicio actualizado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Servicio no encontrado
 */
router.put('/update/:id', validateJWT, isAdmin, updateService);

/**
 * @swagger
 * /services/delete/{id}:
 *   delete:
 *     summary: Eliminar un servicio (solo Admin)
 *     description: Elimina permanentemente un servicio del catálogo.
 *     tags: [Servicios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del servicio
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Servicio eliminado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: Se requieren permisos de administrador
 *       404:
 *         description: Servicio no encontrado
 */
router.delete('/delete/:id', validateJWT, isAdmin, deleteService);

export default router;