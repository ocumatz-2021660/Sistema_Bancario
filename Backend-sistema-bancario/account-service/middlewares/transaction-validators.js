'use strict';

import Cuenta from '../src/account/account.model.js';
import Favorito from '../src/favorite_account/favorite_account.model.js';

export const validateTransactionInput = (req, res, next) => {
  const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;

  if (monto === undefined || monto === null) {
    return res.status(400).json({ success: false, message: 'Monto requerido' });
  }
  if (monto > 2000) {
    return res.status(400).json({ success: false, message: 'El monto no puede exceder los 2000' });
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

export const validateAccountsAndFunds = async (req, res, next) => {
  try {
    const { monto, tipo_transaccion, cuenta_origen, cuenta_destinatoria } = req.body;
    const userId = req.userId;

    // Resolver alias o número de cuenta destino
    let no_cuenta_destino = cuenta_destinatoria;
    const esAlias = !/^\d{10}$/.test(cuenta_destinatoria);

    if (esAlias) {
      const favorito = await Favorito.findOne({
        dueno_favorito: userId,                          // ← sin ñ, igual que tu modelo corregido
        alias_favorito: { $regex: `^${cuenta_destinatoria.trim()}$`, $options: 'i' }
      });

      if (!favorito) {
        return res.status(404).json({
          success: false,
          message: `No se encontró el alias "${cuenta_destinatoria}" en tus favoritos`
        });
      }

      no_cuenta_destino = favorito.no_cuenta; // ← ahora sí tiene el número real
    }

    // Buscar cuenta destinataria usando no_cuenta_destino (ya sea directo o resuelto del alias)
    const cuentaDestino = await Cuenta.findOne({ no_cuenta: no_cuenta_destino, isActive: true });
    if (!cuentaDestino) {
      return res.status(404).json({ success: false, message: 'Cuenta destinataria no existe o está inactiva' });
    }

    // Resolver cuenta origen si aplica
    let cuentaOrigen = null;
    if (cuenta_origen) {
      cuentaOrigen = await Cuenta.findOne({ no_cuenta: cuenta_origen, isActive: true });
      if (!cuentaOrigen) {
        return res.status(404).json({ success: false, message: 'Cuenta origen no existe o está inactiva' });
      }

      if (cuentaOrigen.no_cuenta === cuentaDestino.no_cuenta) {
        return res.status(400).json({ success: false, message: 'La cuenta origen y destinataria no pueden ser la misma' });
      }

      if (Number(cuentaOrigen.saldo) < Number(monto)) {
        return res.status(400).json({ success: false, message: 'Fondos insuficientes en la cuenta origen' });
      }
    }

    req.cuentaOrigen  = cuentaOrigen;
    req.cuentaDestino = cuentaDestino;

    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al validar cuentas', error: error.message });
  }
};