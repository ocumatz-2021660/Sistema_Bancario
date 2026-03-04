'use strict';

import Cuenta from '../account/account.model.js';
import Transaccion from './transaction.model.js';
import { getExchangeRate } from '../../helpers/currency-service.js';
import { sendTransactionEmails, sendCancellationEmails, sendTransactionHistoryEmail } from './transaction_email_processes.js';

// Crear una transacción (transferencia o depósito)
export const createTransaccion = async (req, res) => {
  try {
    const { monto, tipo_transaccion } = req.body;
    const cuentaOrigen  = req.cuentaOrigen;
    const cuentaDestino = req.cuentaDestino;

    const tipo = tipo_transaccion.toUpperCase();

    // Guardar saldos ANTES de modificar
    const saldoAnteriorOrigen  = cuentaOrigen  ? Number(cuentaOrigen.saldo)  : null;
    const saldoAnteriorDestino = Number(cuentaDestino.saldo);

    // Actualizar saldos
    if (cuentaOrigen) {
      cuentaOrigen.saldo = Number(cuentaOrigen.saldo) - Number(monto);
      await cuentaOrigen.save();
    }

    cuentaDestino.saldo = Number(cuentaDestino.saldo) + Number(monto);
    await cuentaDestino.save();

    // Aplicar puntos
    const performingAccount = cuentaOrigen ? cuentaOrigen : cuentaDestino;
    if (performingAccount) {
      performingAccount.puntos_cuenta = (performingAccount.puntos_cuenta || 0) + 150;
      await performingAccount.save();
    }

    // Crear registro de transacción
    const trx = new Transaccion({
      monto:               Number(monto),
      tipo_transaccion:    tipo,
      cuenta_origen:       cuentaOrigen ? cuentaOrigen._id : null,
      cuenta_destinatoria: cuentaDestino._id,
    });

    const nuevaTransaccion = await trx.save();

    // Enviar emails en background (no bloquea la respuesta)
    sendTransactionEmails(
      nuevaTransaccion,
      cuentaOrigen,  saldoAnteriorOrigen,
      cuentaDestino, saldoAnteriorDestino
    ).catch((err) => console.error('Error en notificación por email:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Transacción realizada',
      data:    nuevaTransaccion,
    });

  } catch (error) {
    console.error('ERROR createTransaccion:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la transacción',
      error:   error.message,
    });
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
    let dataFinal = trans.map((t) => t.toObject());

    if (currency && currency.toUpperCase() !== 'GTQ') {
      const rate = await getExchangeRate(currency.toUpperCase());
      if (rate) {
        dataFinal = dataFinal.map((t) => ({
          ...t,
          conversion: {
            moneda_destino:   currency.toUpperCase(),
            tasa:             rate,
            monto_convertido: (t.monto * rate).toFixed(2),
          },
        }));
      }
    }

    return res.status(200).json({
      success: true,
      data:    dataFinal,
      pagination: {
        currentPage:  Number(page),
        totalPages:   Math.ceil(total / limit),
        totalRecords: total,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener transacciones', error: error.message });
  }
};

// Obtener historial de una cuenta (últimas 5)
export const getTransaccionesByCuenta = async (req, res) => {
  try {
    const { id_cuenta } = req.params;
    const { currency }  = req.query;

    const cuenta = await Cuenta.findOne({ _id: id_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
    }

    const trans = await Transaccion.find({
      $or: [{ cuenta_origen: cuenta._id }, { cuenta_destinatoria: cuenta._id }],
    })
      .populate('cuenta_origen')
      .populate('cuenta_destinatoria')
      .limit(5)
      .sort({ createdAt: -1 });

    let dataFinal = trans.map((t) => t.toObject());

    if (currency && currency.toUpperCase() !== 'GTQ') {
      const rate = await getExchangeRate(currency.toUpperCase());
      if (rate) {
        dataFinal = dataFinal.map((t) => ({
          ...t,
          conversion: {
            moneda_destino:   currency.toUpperCase(),
            tasa:             rate,
            monto_convertido: (t.monto * rate).toFixed(2),
          },
        }));
      }
    }

    sendTransactionHistoryEmail(trans, cuenta)
      .catch((err) => console.error('Error enviando historial de transacciones:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Historial obtenido. Se ha enviado un PDF al correo del titular.',
      data:    dataFinal,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener historial', error: error.message });
  }
};

// Cancelar transacción (solo si pasó menos de 1 minuto — devuelve el dinero)
export const deleteTransaccion = async (req, res) => {
  try {
    const transaccion = req.transaccionParaEliminar;
    const { monto, cuenta_origen, cuenta_destinatoria, tipo_transaccion } = transaccion;

    // Revertir saldo destino
    const cuentaDestino = await Cuenta.findById(cuenta_destinatoria);
    let saldoAnteriorDestino = null;
    if (cuentaDestino) {
      saldoAnteriorDestino    = Number(cuentaDestino.saldo);
      cuentaDestino.saldo     = saldoAnteriorDestino - Number(monto);
      if (tipo_transaccion === 'DEPOSITO') {
        cuentaDestino.puntos_cuenta = Math.max(0, (cuentaDestino.puntos_cuenta || 0) - 1);
      }
      await cuentaDestino.save();
    }

    // Devolver dinero a origen
    let cuentaOrigenDoc     = null;
    let saldoAnteriorOrigen = null;
    if (cuenta_origen) {
      cuentaOrigenDoc = await Cuenta.findById(cuenta_origen);
      if (cuentaOrigenDoc) {
        saldoAnteriorOrigen   = Number(cuentaOrigenDoc.saldo);
        cuentaOrigenDoc.saldo = saldoAnteriorOrigen + Number(monto);
        if (tipo_transaccion === 'TRANSFERENCIA') {
          cuentaOrigenDoc.puntos_cuenta = Math.max(0, (cuentaOrigenDoc.puntos_cuenta || 0) - 1);
        }
        await cuentaOrigenDoc.save();
      }
    }

    await Transaccion.findByIdAndDelete(transaccion._id);

    // Notificar cancelación a ambas cuentas
    sendCancellationEmails(
      transaccion,
      cuentaOrigenDoc,  saldoAnteriorOrigen,
      cuentaDestino,    saldoAnteriorDestino
    ).catch((err) => console.error('Error en notificación de cancelación:', err.message));

    return res.status(200).json({ success: true, message: 'Transacción eliminada correctamente' });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al revertir la transacción', error: error.message });
  }
};