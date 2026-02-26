import { Router } from "express";
import { canjearServicio, 
        getAllCanjes, 
        getCanjesByCuenta,
        cancelarCanje,
     } 
from "./redeem_service.controller.js";
import { isAdmin } from "../../middlewares/is.admin.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { verificarPuntos } from "../../middlewares/redeem_service.validation.js";
import { canCancelCanje } from "../../middlewares/time-out-redeem_service.js";

const router = Router();

router.post('/redeem',validateJWT, verificarPuntos, canjearServicio);
router.get('/:cuenta_id', getCanjesByCuenta);
router.get('/', validateJWT,isAdmin, getAllCanjes);
router.delete('/cancel/:id', canCancelCanje, cancelarCanje);

export default router;