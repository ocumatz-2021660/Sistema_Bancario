'use strict';

import mongoose from "mongoose";

const solicitudSchema = mongoose.Schema(
    {
        id_solicitud: {
            type: String,
            unique: true,
            trim: true,
            uppercase: true,
        },

        fecha_solicitud: {
            type: Date,
            required: [true, 'La fecha de solicitud es requerido'],
            default: Date.now
        },

        estado_solicitud: {
            type: String,
            required: [true, 'El estado de la solicitud es requerido'],
            enum: {
                values: ['PENDIENTE', 'APROBADA', 'RECHAZADA'],
                message: 'Estado no válido, debe ser PENDIENTE, APROBADA O RECHAZADA'
            },
            default: 'PENDIENTE'
        },

        cuenta: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Cuenta',
            required: [true, 'La cuenta es requerida'],
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
)

solicitudSchema.index({ isActive: 1});
solicitudSchema.index({ estado_solicitud: 1});
solicitudSchema.index({ isActive: 1, estado_solicitud: 1});
solicitudSchema.pre('save', async function() {
    if (this.isNew && !this.id_solicitud) {
        const last = await mongoose.model('Solicitud')
            .findOne()
            .sort({ createdAt: -1 })
            .select('id_solicitud');
        let nextNum = 1;
        if (last?.id_solicitud) {
            const num = parseInt(last.id_solicitud.replace('SOL-', ''), 10);
            if (!isNaN(num)) nextNum = num + 1;
        }
        this.id_solicitud = `SOL-${String(nextNum).padStart(6, '0')}`;
    }
});

export default mongoose.model('Solicitud', solicitudSchema);