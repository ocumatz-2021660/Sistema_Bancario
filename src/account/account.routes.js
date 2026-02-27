import { Router } from "express";
import {validateJWT} from "../../middlewares/validate-JWT.js";
import {isAdmin} from "../../middlewares/is.admin.js";
import {
    createCuenta,
    getCuentas,
    getCuentaById,
    getCuentasByUsuario,
    getFavoritos,
    updateSaldo,
    deleteCuenta,
} from "./account.controller.js";

const router = Router();

router.post('/create', createCuenta);

router.get('/',validateJWT, isAdmin, getCuentas);

router.get('/buscar/favoritos', getFavoritos);

router.get('/usuario/:usuario_id', getCuentasByUsuario);

router.get('/:id', getCuentaById);

router.put('/:id/saldo',validateJWT, isAdmin, updateSaldo);

router.put('/:id/deactivate', validateJWT, isAdmin, deleteCuenta);

export default router;