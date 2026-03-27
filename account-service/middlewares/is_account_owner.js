
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
export const isAccountOwnerWithdrawal = async (req, res, next) => {
  try {
    const currentUserId = req.userId; // viene de validateJWT
    const { no_cuenta } = req.body;

    if (!no_cuenta) {
      return res.status(400).json({
        success: false,
        message: 'El campo "no_cuenta" es requerido.',
      });
    }

    const cuenta = await Cuenta.findOne({ no_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada o inactiva.',
      });
    }

    if (cuenta.usuario_cuenta !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. No eres el propietario de esta cuenta.',
      });
    }

    req.cuenta = cuenta; // disponible en el controller
    next();
  } catch (error) {
    console.error('Error en isAccountOwnerWithdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al verificar propiedad de cuenta.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

//Middleware: valida el monto del retiro 
export const validateWithdrawalInput = (req, res, next) => {
  const { monto } = req.body;

  if (monto === undefined || monto === null) {
    return res.status(400).json({ success: false, message: 'El campo "monto" es requerido.' });
  }

  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ success: false, message: 'El monto debe ser un número mayor que 0.' });
  }

  next();
};