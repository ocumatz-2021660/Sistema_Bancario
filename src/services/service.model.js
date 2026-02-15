'use strict';

import mongoose from "mongoose";

const serviceSchema = mongoose.Schema(
    {
        descripcion_servicio: {
            type: String,
            required: [true, 'La descripción del servicio es requerida'],
            trim: true,
            maxLength: [200, 'La descripción no puede exceder 200 caracteres']
        },
        puntos_minimos_servicio: {
            type: Number,
            required: [true, 'Los puntos mínimos son requeridos'],
            min: [0, 'Los puntos mínimos deben ser mayor o igual a 0']
        },
        cuenta_servicio: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cuenta', // Referencia al modelo de tu compañero
            required: [true, 'El ID de la cuenta es requerido']
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

serviceSchema.index({ isActive: 1 });

export default mongoose.model('Service', serviceSchema);