'use strict';

import Transaccion from '../src/transactions/transaction.model.js'; 
import Cuenta from '../src/account/account.model.js';

export const validateDailyLimit = async (req, res, next) => {
    try {
        const { monto } = req.body;
        const cuentaOrigen = req.cuentaOrigen; 
        const LIMITE_DIARIO = 2000;

        // solo depositos externos saltan el proceso (recibe dinero)
        if (!cuentaOrigen) return next();

        // transcurso para continuar
        const inicioDia = new Date();
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date();
        finDia.setHours(23, 59, 59, 999);

        // Buscar todas las transacciones de hoy con relacion a la cuenta d eorigen
        const transaccionesHoy = await Transaccion.find({
            cuenta_origen: cuentaOrigen._id,
            createdAt: { $gte: inicioDia, $lte: finDia }
        });

        // Sumar los montos de las transacciones ya realizadas (comparar si llega a 2000)
        const totalHoy = transaccionesHoy.reduce((acc, trx) => acc + Number(trx.monto), 0);

        // Verificar si la nueva transacción supera el límite
        if (totalHoy + Number(monto) > LIMITE_DIARIO) {
            return res.status(400).json({
                success: false,
                message: `Límite diario excedido. Has transferido Q${totalHoy} hoy. El límite es Q${LIMITE_DIARIO}.`
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: 'Error al validar límite diario', 
            error: error.message 
        });
    }
};