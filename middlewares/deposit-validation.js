'use strict';

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