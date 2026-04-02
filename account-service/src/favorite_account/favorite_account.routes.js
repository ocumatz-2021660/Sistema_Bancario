'use strict';

import { Router } from 'express';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';
import { addFavorito, getMisFavoritos, updateAliasFavorito, deleteFavorito } from './favorite_account.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Favoritos
 *   description: Gestión de cuentas favoritas para transferencias rápidas
 */

/**
 * @swagger
 * /favorite:
 *   post:
 *     summary: Agregar una cuenta a favoritos
 *     description: >
 *       Guarda una cuenta con un alias personal para identificarla fácilmente.
 *       El alias luego puede usarse directamente en transferencias en lugar del número de cuenta.
 *       No se puede agregar la propia cuenta como favorito.
 *     tags: [Favoritos]
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
 *               - alias_favorito
 *             properties:
 *               no_cuenta:
 *                 type: string
 *                 example: "2491903918"
 *                 description: Número de cuenta de 10 dígitos a guardar como favorito
 *               alias_favorito:
 *                 type: string
 *                 example: El admin jr del server
 *                 description: Nombre personal para identificar esta cuenta, máximo 50 caracteres
 *     responses:
 *       201:
 *         description: Favorito agregado exitosamente
 *       400:
 *         description: No puedes agregar tu propia cuenta como favorito
 *       401:
 *         description: Token requerido o inválido
 *       404:
 *         description: La cuenta especificada no existe o está inactiva
 *       409:
 *         description: Esta cuenta ya está en tus favoritos
 */
router.post('/', validateJWT, addFavorito);

/**
 * @swagger
 * /favorite:
 *   get:
 *     summary: Ver mis favoritos
 *     description: Retorna todas las cuentas guardadas como favoritas por el usuario autenticado.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado de favoritos obtenido exitosamente
 *       401:
 *         description: Token requerido o inválido
 */
router.get('/', validateJWT, getMisFavoritos);

/**
 * @swagger
 * /favorite/{id}:
 *   put:
 *     summary: Actualizar el alias de un favorito
 *     description: Cambia el nombre con el que identificas una cuenta favorita. Solo el dueño del favorito puede modificarlo.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del favorito
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alias_favorito
 *             properties:
 *               alias_favorito:
 *                 type: string
 *                 example: Mi amigo del banco
 *     responses:
 *       200:
 *         description: Alias actualizado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No tienes permiso para modificar este favorito
 *       404:
 *         description: Favorito no encontrado
 */
router.put('/:id', validateJWT, updateAliasFavorito);

/**
 * @swagger
 * /favorite/{id}:
 *   delete:
 *     summary: Eliminar un favorito
 *     description: Elimina una cuenta de tu lista de favoritos. Solo el dueño puede eliminarlo.
 *     tags: [Favoritos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB del favorito
 *         example: 664f1b2e8c4a2d001f3e9abc
 *     responses:
 *       200:
 *         description: Favorito eliminado exitosamente
 *       401:
 *         description: Token requerido o inválido
 *       403:
 *         description: No tienes permiso para eliminar este favorito
 *       404:
 *         description: Favorito no encontrado
 */
router.delete('/:id', validateJWT, deleteFavorito);

export default router;