'use strict';

import Cuenta from '../account/account.model.js';
import Deposito from './deposit.model.js';
import { sendDepositEmail, sendDepositHistoryEmail } from './deposit-email.process.js';


export const createDeposito = async (req, res) => {
  try {
    const { monto, no_cuenta } = req.body;
    const depositadoPor = req.userId; // viene de validateJWT

    const montoNum = Number(monto);

    const cuenta = await Cuenta.findOne({ no_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada o inactiva',
      });
    }

    const saldoAnterior  = Number(cuenta.saldo);
    const saldoPosterior = saldoAnterior + montoNum;

    cuenta.saldo = saldoPosterior;
    await cuenta.save();

    const deposito = new Deposito({
      monto:           montoNum,
      cuenta:          cuenta._id,
      depositado_por:  depositadoPor,
      saldo_anterior:  saldoAnterior,
      saldo_posterior: saldoPosterior,
    });

    const nuevoDeposito = await deposito.save();

    //deposit-email.process
    sendDepositEmail(nuevoDeposito, cuenta)
      .catch((err) => console.error('Error en notificacion de deposito:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Deposito realizado exitosamente',
      data:    nuevoDeposito,
    });

  } catch (error) {
    console.error('ERROR createDeposito:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar el deposito',
      error:   error.message,
    });
  }
};

export const getDepositos = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [depositos, total] = await Promise.all([
      Deposito.find()
        .populate('cuenta')
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .sort({ createdAt: -1 }),
      Deposito.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data:    depositos,
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
      message: 'Error al obtener los depositos',
      error:   error.message,
    });
  }
};

export const getDepositosByCuenta = async (req, res) => {
  try {
    const { id_cuenta } = req.params;

    const cuenta = await Cuenta.findOne({ _id: id_cuenta, isActive: true });
    if (!cuenta) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada o inactiva',
      });
    }

    const depositos = await Deposito.find({ cuenta: cuenta._id })
      .limit(5)
      .sort({ createdAt: -1 });

    sendDepositHistoryEmail(depositos, cuenta)
      .catch((err) => console.error('Error enviando historial de depositos:', err.message));

    return res.status(200).json({
      success: true,
      message: 'Historial obtenido. Se ha enviado un PDF al correo del titular.',
      data:    depositos,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los depositos de la cuenta',
      error:   error.message,
    });
  }
};