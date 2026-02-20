'use strict';

import Cuenta from '../cuentas/cuenta.model.js';
import Transaccion from './transaction.model.js';
import { getExchangeRate } from '../../helpers/currency-service.js';

// Crear una transacción (transferencia o depósito)
export const createTransaccion = async (req, res) => {
  try {
    const { monto, tipo_transaccion } = req.body;
    const cuentaOrigen = req.cuentaOrigen;
    const cuentaDestino = req.cuentaDestino;

    const tipo = tipo_transaccion.toUpperCase();

    // Actualizar saldos
    if (cuentaOrigen) {
      cuentaOrigen.saldo = Number(cuentaOrigen.saldo) - Number(monto);
      await cuentaOrigen.save();
    }

    cuentaDestino.saldo = Number(cuentaDestino.saldo) + Number(monto);
    await cuentaDestino.save();

    // Aplicar puntos a la cuenta que realiza la transacción
    // Si existe cuentaOrigen (transferencia), se considera la cuenta que realiza la operación.
    // Para depósitos sin origen, se consideran puntos para la cuenta destinatoria.
    const performingAccount = cuentaOrigen ? cuentaOrigen : cuentaDestino;
    if (performingAccount) {
      performingAccount.puntos_cuenta = (performingAccount.puntos_cuenta || 0) + 1;
      await performingAccount.save();
    }

    // Crear registro de transacción
    const trx = new Transaccion({
      monto: Number(monto),
      tipo_transaccion: tipo,
      cuenta_origen: cuentaOrigen ? cuentaOrigen._id : null,
      cuenta_destinatoria: cuentaDestino._id
    });

    const nuevaTransaccion = await trx.save();

    return res.status(201).json({ success: true, message: 'Transacción realizada', data: nuevaTransaccion });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al procesar la transacción', error: error.message });
  }
};

// Obtener transacciones (paginado)
export const getTransacciones = async (req, res) => {
  try {
    const { page = 1, limit = 10, currency } = req.query;
    const trans = await Transaccion.find()
      .populate('cuenta_origen')
      .populate('cuenta_destinatoria')
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Transaccion.countDocuments();

    // lógica para conversión de moneda si se especifica una moneda diferente a GTQ
    let dataFinal = trans.map(t => t.toObject());

    if (currency && currency.toUpperCase() !== 'GTQ') {
      const rate = await getExchangeRate(currency.toUpperCase());

      if (rate) {
        dataFinal = dataFinal.map(t => ({
          ...t,
          conversion: {
            moneda_destino: currency.toUpperCase(),
            tasa: rate,
            monto_convertido: (t.monto * rate).toFixed(2)
          }
        }));
      }
    }

    return res.status(200).json({ success: true, data: dataFinal, pagination: { currentPage: Number(page), totalPages: Math.ceil(total / limit), totalRecords: total } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener transacciones', error: error.message });
  }
};

// Obtener historial de una cuenta (últimas 5 transacciones)
export const getTransaccionesByCuenta = async (req, res) => {
  try {
    const { no_cuenta } = req.params;
    const { currency } = req.query; // Para permitir conversión de moneda en el historial

    const cuenta = await Cuenta.findOne({ no_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    const trans = await Transaccion.find({
      $or: [{ cuenta_origen: cuenta._id }, { cuenta_destinatoria: cuenta._id }]
    })
      .populate('cuenta_origen')
      .populate('cuenta_destinatoria')
      .limit(5)
      .sort({ createdAt: -1 });

    // lógica para conversión de moneda si se especifica una moneda diferente a GTQ
    let dataFinal = trans.map(t => t.toObject());

    if (currency && currency.toUpperCase() !== 'GTQ') {
      const rate = await getExchangeRate(currency.toUpperCase());

      if (rate) {
        dataFinal = dataFinal.map(t => ({
          ...t,
          conversion: {
            moneda_destino: currency.toUpperCase(),
            tasa: rate,
            monto_convertido: (t.monto * rate).toFixed(2)
          }
        }));
      }
    }

    return res.status(200).json({ success: true, data: dataFinal });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener historial', error: error.message });
  }
};
