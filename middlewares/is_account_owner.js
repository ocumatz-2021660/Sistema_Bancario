
import Cuenta from '../src/account/account.model.js';

export const isAccountOwnerTransaction = async (req, res, next) => {
    try {
        const currentUserId = req.userId; // viene de validateJWT

        if (!currentUserId) {
            return res.status(401).json({
                success: false,
                message: 'No autenticado. Token requerido.',
            });
        }

        const { cuenta_origen } = req.body;
        if (!cuenta_origen) {//verifica que exista una cuenta de origen
            return next();
        }

        const cuenta = await Cuenta.findOne({
            no_cuenta: cuenta_origen,
            isActive: true
        });

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta origen no encontrada o inactiva.',
            });
        }
        //comparacion
        if (cuenta.usuario_cuenta !== currentUserId) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado. No eres el propietario de esta cuenta.',
            });
        }

        req.cuentaOrigen = cuenta;

        next();
    } catch (error) {
        console.error('Error en middleware isAccountOwner:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno al verificar propiedad de cuenta.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
