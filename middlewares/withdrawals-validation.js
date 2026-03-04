'use strict';

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