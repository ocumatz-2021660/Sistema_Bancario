import { Router } from 'express';
import { getRate } from './currency.controller.js';
import { validateJWT } from '../../../auth-service/middlewares/validate-JWT.js';

const router = Router();

router.get('/rate', validateJWT, getRate);

export default router;
