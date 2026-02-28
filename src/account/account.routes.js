import {
    createCuenta,
    getCuentas,
    getCuentaById,
    getCuentasByUsuario,
    getFavoritos,
    updateSaldo,
    deleteCuenta,
    hardDeleteCuenta,
    activateCuenta,
} from "./account.controller.js";

const router = Router();

router.post('/create', createCuenta);

router.get('/',validateJWT, isAdmin, getCuentas);

router.get('/buscar/favoritos', getFavoritos);

router.get('/usuario/:usuario_id', getCuentasByUsuario);

router.get('/:id', getCuentaById);

router.put('/:id/saldo',validateJWT, isAdmin, updateSaldo);

router.put('/:id/desactivate', validateJWT, isAdmin, deleteCuenta);
router.put('/:id/activate', validateJWT, isAdmin, activateCuenta);

router.delete('/:id/delete', validateJWT, isAdmin, hardDeleteCuenta);

export default router;