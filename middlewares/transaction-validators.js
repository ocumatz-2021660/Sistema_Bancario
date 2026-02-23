'use strict';

import Cuenta from '../src/account/account.model.js';

// Validar datos de entrada de transacción
export const validateTransactionInput = (req, res, next) => {
  const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;

  // Validar que monto es un número válido (enteros o decimales)
  if (monto === undefined || monto === null) {
    return res.status(400).json({ success: false, message: 'Monto requerido' });
  }

  const montoStr = String(monto).trim();
  const numeroValido = /^\d+(\.\d+)?$/.test(montoStr);
  if (!numeroValido) {
    return res.status(400).json({ success: false, message: 'El monto debe ser un número válido (solo dígitos y punto decimal)' });
  }

  const montoNum = Number(monto);
  if (!Number.isFinite(montoNum) || montoNum <= 0) {
    return res.status(400).json({ success: false, message: 'Monto inválido, debe ser mayor que 0' });
  }

  if (!tipo_transaccion) {
    return res.status(400).json({ success: false, message: 'Tipo de transacción requerido' });
  }

  const tipo = tipo_transaccion.toUpperCase();

  if (!['TRANSFERENCIA', 'DEPOSITO'].includes(tipo)) {
    return res.status(400).json({ success: false, message: 'Tipo de transacción no válido' });
  }

  if (!cuenta_destinatoria) {
    return res.status(400).json({ success: false, message: 'Cuenta destinataria requerida' });
  }

  if (tipo === 'TRANSFERENCIA' && !cuenta_origen) {
    return res.status(400).json({ success: false, message: 'Cuenta origen requerida para transferencia' });
  }

  next();
};

// Validar existencia de cuentas y fondos
export const validateAccountsAndFunds = async (req, res, next) => {
  try {
    const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;

    // Buscar cuenta destinatoria
    const cuentaDestino = await Cuenta.findOne({ no_cuenta: cuenta_destinatoria, isActive: true });
    if (!cuentaDestino) {
      return res.status(404).json({ success: false, message: 'Cuenta destinataria no existe' });
    }

    // Si hay cuenta_origen, buscarla y validar fondos
    let cuentaOrigen = null;
    if (cuenta_origen) {
      cuentaOrigen = await Cuenta.findOne({ no_cuenta: cuenta_origen, isActive: true });
      if (!cuentaOrigen) {
        return res.status(404).json({ success: false, message: 'Cuenta origen no existe' });
      }

      // Validar fondos suficientes
      if (Number(cuentaOrigen.saldo) < Number(monto)) {
        return res.status(400).json({ success: false, message: 'Fondos insuficientes en la cuenta origen' });
      }
    }

    // Guardar cuentas en el request para usarlas en el controlador
    req.cuentaOrigen = cuentaOrigen;
    req.cuentaDestino = cuentaDestino;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al validar cuentas', error: error.message });
  }
};
