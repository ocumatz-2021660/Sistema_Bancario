import { Router } from "express";
import { createSolicitud, getSolicitudes } from "./solicitud.controller.js";

const router = Router();

router.post(
    '/create',
    createSolicitud
);

router.get(
    '/', 
    getSolicitudes
);

export default router;