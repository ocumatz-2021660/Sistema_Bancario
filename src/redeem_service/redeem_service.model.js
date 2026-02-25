'use strict';

import mongoose from "mongoose";

const canjeSchema = mongoose.Schema(
    {
        cuenta_canje: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cuenta',
            required: [true, 'La cuenta es requerida']
        },
        servicio_canje: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service',
            required: [true, 'El servicio es requerido']
        },
        estado_canje: {
            type: String,
            enum: {
                values: ['COMPLETADO', 'CANCELADO'],
                message: 'Estado de canje no válido'
            },
            default: 'COMPLETADO'
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

canjeSchema.index({ cuenta_canje: 1 });
canjeSchema.index({ servicio_canje: 1 });
canjeSchema.index({ createdAt: -1 });

export default mongoose.model('Canje', canjeSchema);