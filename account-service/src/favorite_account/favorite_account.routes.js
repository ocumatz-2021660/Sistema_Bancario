'use strict';

import { Router } from 'express';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';
import { addFavorito, getMisFavoritos, updateAliasFavorito, deleteFavorito } from './favorite_account.controller.js';

const router = Router();

router.post('/', validateJWT, addFavorito);
router.get('/', validateJWT, getMisFavoritos);
router.put('/:id', validateJWT, updateAliasFavorito);
router.delete('/:id', validateJWT, deleteFavorito);

export default router;