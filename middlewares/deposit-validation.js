'use strict';
import Cuenta from '../src/account/account.model.js';
import Deposito from '../src/deposit/deposit.model.js';

export const validateDepositInput = (req, res, next) => {
  const { monto, no_cuenta } = req.body;

  if (!no_cuenta) {
    return res.status(400).json({ success: false, message: 'El campo "no_cuenta" es requerido.' });
  }

  if (monto === undefined || monto === null) {
    return res.status(400).json({ success: false, message: 'El campo "monto" es requerido.' });
  }

  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ success: false, message: 'El monto debe ser un numero mayor que 0.' });
  }

  next();
};

export const validateDailyDepositLimit = async (req, res, next) => {
  try {
    const LIMITE_DIARIO = 2000;
    const { no_cuenta, monto } = req.body;

    const cuenta = await Cuenta.findOne({ no_cuenta, isActive: true });
    if (!cuenta) return next(); 

    const hoy = new Date();
    const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
    const finDia    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

    const resultado = await Deposito.aggregate([
      {
        $match: {
          cuenta:         cuenta._id,
          fecha_deposito: { $gte: inicioDia, $lte: finDia },
        },
      },
      {
        $group: {
          _id:   null,
          total: { $sum: '$monto' },
        },
      },
    ]);

    const totalHoy    = resultado.length > 0 ? resultado[0].total : 0;
    const montoNuevo  = Number(monto);
    const totalFinal  = totalHoy + montoNuevo;

    if (totalFinal > LIMITE_DIARIO) {
      const disponible = Math.max(0, LIMITE_DIARIO - totalHoy);
      return res.status(400).json({
        success:   false,
        message:   `Limite diario de depositos alcanzado para esta cuenta.`,
        detalle: {
          limite_diario:     `Q ${LIMITE_DIARIO.toFixed(2)}`,
          depositado_hoy:    `Q ${totalHoy.toFixed(2)}`,
          disponible_hoy:    `Q ${disponible.toFixed(2)}`,
          monto_solicitado:  `Q ${montoNuevo.toFixed(2)}`,
        },
      });
    }

    next();
  } catch (error) {
    console.error('Error en validateDailyDepositLimit:', error);
    return res.status(500).json({ success: false, message: 'Error al validar limite diario.', error: error.message });
  }
};