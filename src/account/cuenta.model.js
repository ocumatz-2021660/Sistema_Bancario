'use strict';

import mongoose from "mongoose";
import { generarNumeroCuenta } from "../../middlewares/cuenta-validation.js";

const cuentaSchema = mongoose.Schema(
    {
        no_cuenta: {
            type: String,
            unique: true,
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v);
                },
                message: 'El número de cuenta debe contener exactamente 10 dígitos numéricos'
            }
        },
        saldo: {
            type: Number,
            required: [true, 'El saldo es obligatorio'],
            default: 0,
            min: [0, 'El saldo no puede ser negativo'],          
        },
        tipo_cuenta: {
            type: String,
            required: [true, 'El tipo de cuenta es obligatorio'],
            enum: {
                values: ['AHORRO', 'MONETARIA'],
                message: 'Tipo de cuenta no válido. Debe ser AHORRO o MONETARIA'
            },
            uppercase: true
        },
        puntos_cuenta: {
            type: Number,
            default: 0,
            min: [0, 'Los puntos no pueden ser negativos']
        },
        usuario_cuenta: {
            type: String,
            ref: 'Usuario',
            required: [true, 'El usuario es obligatorio']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        //Agregar atributo de alias para manejo de favoritos
        alias:{
            type: String,
            trim: true,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);
/*
// Middleware Pre
cuentaSchema.pre('validate', preValidateCuenta);

// Métodos de instancia
cuentaSchema.methods.getLimiteTransaccion = getLimiteTransaccion;
cuentaSchema.methods.agregarOperacion = agregarOperacion;
*/
cuentaSchema.index({ usuario_cuenta: 1 });
cuentaSchema.index({ tipo_cuenta: 1 });
cuentaSchema.index({ isActive: 1 });

cuentaSchema.pre('save', generarNumeroCuenta);

export default mongoose.model('Cuenta', cuentaSchema);
