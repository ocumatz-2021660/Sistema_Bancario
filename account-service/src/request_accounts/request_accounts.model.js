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
solicitudSchema.pre('save', async function(next) {
    if (!this.id_solicitud) {
        const count = await mongoose.model('Solicitud').countDocuments();
        this.id_solicitud = `SOL-${String(count + 1).padStart(6, '0')}`;
    }
});

export default mongoose.model('Solicitud', solicitudSchema);