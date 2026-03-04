'use strict';

import mongoose from 'mongoose';

const depositoSchema = mongoose.Schema(
  {
    id_deposito: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0.01, 'El monto debe ser mayor que 0'],
    },

    fecha_deposito: {
      type: Date,
      required: true,
      default: Date.now,
    },

    cuenta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      required: [true, 'La cuenta es requerida'],
    },

    // ID del usuario que realizó el depósito (puede ser cualquiera)
    depositado_por: {
      type: String,
      required: [true, 'El usuario que realiza el depósito es requerido'],
    },

    saldo_anterior: {
      type: Number,
      required: true,
    },

    saldo_posterior: {
      type: Number,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

depositoSchema.index({ cuenta: 1 });
depositoSchema.index({ depositado_por: 1 });

depositoSchema.pre('save', async function () {
  if (!this.id_deposito) {
    const count = await mongoose.model('Deposito').countDocuments();
    this.id_deposito = `DEP-${String(count + 1).padStart(6, '0')}`;
  }
});

export default mongoose.model('Deposito', depositoSchema);