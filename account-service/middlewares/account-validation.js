'use strict';

import Cuenta from '../src/account/account.model.js';

// Validar datos de entrada de transacción
export const validateAccountInput = (req, res, next) => {

    const { tipo_cuenta, saldo } = req.body;

    if( saldo !== undefined || saldo !== null ) {
        if( typeof saldo !== 'number' || saldo < 0 ) {
            return res.status(400).json({ error: 'El saldo debe ser un número positivo' });
        }
    }
    if( saldo < 100){
        return res.status(400).json({ error: 'El saldo mínimo debe ser de 100Q' });
    }

    next();
};