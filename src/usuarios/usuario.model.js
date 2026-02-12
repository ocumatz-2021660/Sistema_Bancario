'use strict';

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const usuarioSchema = mongoose.Schema(
    {
        nombre_user: {
            type: String,
            required: [true, 'El nombre del usuario es obligatorio'],
            trim: true,
            maxLength: [100, 'El nombre no puede exceder de 100 caracteres']
        },
        username: {
            type: String,
            required: [true, 'El username es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            maxLength: [50, 'El username no puede exceder de 50 caracteres']
        },
        dpi_cui: {
            type: String,
            required: [true, 'El DPI/CUI es obligatorio'],
            unique: true,
            trim: true,
            minLength: [13, 'El DPI/CUI debe tener 13 dígitos'],
            maxLength: [13, 'El DPI/CUI debe tener 13 dígitos'],
            validate: {
                validator: function(v) {
                    return /^\d{13}$/.test(v);
                },
                message: 'El DPI/CUI debe contener solo 13 dígitos numéricos'
            }
        },
        email_user: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: 'Email no válido'
            }
        },
        passwordHash: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minLength: [8, 'La contraseña debe tener al menos 8 caracteres']
        },
        estado: {
            type: String,
            enum: {
                values: ['PENDIENTE', 'ACTIVO', 'DESHABILITADA'],
                message: 'Estado no válido'
            },
            default: 'PENDIENTE',
            uppercase: true
        },
        estadoFavorito: {
            type: String,
            enum: {
                values: ['FAVORITO', 'NORMAL'],
                message: 'Estado favorito no válido'
            },
            default: 'NORMAL',
            uppercase: true
        },
        rol: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rol',
            required: [true, 'El rol es obligatorio']
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

// Middleware para hashear la contraseña antes de guardar
usuarioSchema.pre('save', async function() {
    if (!this.isModified('passwordHash')) {
        return;
    }
    
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// No devolver el password en las consultas por defecto
usuarioSchema.methods.toJSON = function() {
    const obj = this.toObject();
    delete obj.passwordHash;
    return obj;
};

// Índices (solo para campos que NO tienen unique: true)
usuarioSchema.index({ estado: 1 });
usuarioSchema.index({ rol: 1 });

export default mongoose.model('Usuario', usuarioSchema);