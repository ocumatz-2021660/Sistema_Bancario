// solicitud.routes.js
import { Router } from "express";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { isAdmin } from "../../middlewares/is.admin.js";
import {
    getSolicitudes,
    getSolicitudById,
    aprobarSolicitud,
    rechazarSolicitud,
} from "./request_accounts.controller.js";

const router = Router();

// Todas las rutas son solo para admins
router.get('/',           validateJWT, isAdmin, getSolicitudes);
router.get('/:id',        validateJWT, isAdmin, getSolicitudById);
router.put('/:id/aprobar',  validateJWT, isAdmin, aprobarSolicitud);
router.put('/:id/rechazar', validateJWT, isAdmin, rechazarSolicitud);

export default router;