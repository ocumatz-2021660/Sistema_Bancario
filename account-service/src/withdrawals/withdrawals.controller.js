'use strict';

import Cuenta from '../account/account.model.js';
import Retiro from './withdrawals.model.js';
import { sendWithdrawalEmail, sendWithdrawalHistoryEmail } from './withdrawal-email.processes.js';

// Crear retiro
export const createRetiro = async (req, res) => {
  try {
    const { monto } = req.body;
    const cuenta    = req.cuenta;

    const montoNum       = Number(monto);
    const saldoAnterior  = Number(cuenta.saldo);
    const saldoPosterior = saldoAnterior - montoNum;

    if (saldoPosterior < 0) {
      return res.status(400).json({
        success: false,
        message: 'Fondos insuficientes para realizar el retiro',
      });
    }

    cuenta.saldo = saldoPosterior;
    await cuenta.save();

    const retiro = new Retiro({
      monto:           montoNum,
      cuenta:          cuenta._id,
      saldo_anterior:  saldoAnterior,
      saldo_posterior: saldoPosterior,
    });

    const nuevoRetiro = await retiro.save();

    sendWithdrawalEmail(nuevoRetiro, cuenta)
      .catch((err) => console.error('Error en notificacion de retiro:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Retiro realizado exitosamente',
      data:    nuevoRetiro,
    });

  } catch (error) {
    console.error('ERROR createRetiro:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el retiro',
      error:   error.message,
    });
  }
};

// Obtener todos los retiros (admin, paginado)
export const getRetiros = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [retiros, total] = await Promise.all([
      Retiro.find()
        .populate('cuenta')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 }),
      Retiro.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data:    retiros,
      pagination: {
        currentPage:  parseInt(page),
        totalPages:   Math.ceil(total / limit),
        totalRecords: total,
        limit:        parseInt(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los retiros',
      error:   error.message,
    });
  }
};

// Obtener ultimos 5 retiros de una cuenta y enviar PDF al dueno por correo
export const getRetirosByCuenta = async (req, res) => {
  try {
    const { id_cuenta } = req.params;

    const cuenta = await Cuenta.findOne({ _id: id_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada o inactiva',
      });
    }

    const retiros = await Retiro.find({ cuenta: cuenta._id })
      .limit(5)
      .sort({ createdAt: -1 });

    // Enviar PDF del historial por correo en background
    sendWithdrawalHistoryEmail(retiros, cuenta)
      .catch((err) => console.error('Error enviando historial:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Historial obtenido. Se ha enviado un PDF al correo del titular.',
      data:    retiros,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los retiros de la cuenta',
      error:   error.message,
    });
  }
};