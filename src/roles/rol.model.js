'use strict';

import mongoose from "mongoose";

const rolSchema = mongoose.Schema(
    {
        tipo_rol: {
            type: String,
            required: [true, 'El tipo de rol es obligatorio'],
            enum: {
                values: ['ADMIN', 'NORMAL'],
                message: 'Tipo de rol no válido. Debe ser ADMIN o NORMAL'
            },
            uppercase: true,
            trim: true
        },
        descripcion_rol: {
            type: String,
            required: [true, 'La descripción del rol es requerida'],
            trim: true,
            maxLength: [200, 'La descripción no puede exceder de 200 caracteres']
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

// Índices para optimizar búsquedas
rolSchema.index({ tipo_rol: 1 });
rolSchema.index({ isActive: 1 });

export default mongoose.model('Rol', rolSchema);
