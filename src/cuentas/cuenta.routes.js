import { Router } from "express";
import {
    createCuenta,
    getCuentas,
    getCuentaById,
    getCuentasByUsuario,
} from "./cuenta.controller.js";

const router = Router();

// Crear una nueva cuenta
router.post('/create', createCuenta);
// Obtener todas las cuentas
router.get('/', getCuentas);
// Obtener una cuenta específica por ID
router.get('/:id', getCuentaById);
// Obtener cuentas de un usuario específico
router.get('/usuario/:usuario_id', getCuentasByUsuario);

export default router;
