'use strict';

import mongoose from "mongoose";

// Este modelo es un CATÁLOGO de servicios disponibles para canjear.
// Ya no está atado a ninguna cuenta específica.
const serviceSchema = mongoose.Schema(
    {
        nombre_servicio: {
            type: String,
            required: [true, 'El nombre del servicio es requerido'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder 100 caracteres']
        },
        descripcion_servicio: {
            type: String,
            required: [true, 'La descripción del servicio es requerida'],
            trim: true,
            maxLength: [200, 'La descripción no puede exceder 200 caracteres']
        },
        puntos_requeridos: {
            type: Number,
            required: [true, 'Los puntos requeridos son obligatorios'],
            min: [1, 'Los puntos requeridos deben ser mayor a 0']
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
serviceSchema.index({ puntos_requeridos: 1 });

export default mongoose.model('Service', serviceSchema);