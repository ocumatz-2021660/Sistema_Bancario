'use strict';

import mongoose from 'mongoose';

const retiroSchema = mongoose.Schema(
  {
    id_retiro: {
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

    fecha_retiro: {
      type: Date,
      required: true,
      default: Date.now,
    },

    cuenta: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      required: [true, 'La cuenta es requerida'],
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

retiroSchema.index({ cuenta: 1 });

retiroSchema.pre('save', async function () {
  if (!this.id_retiro) {
    const count = await mongoose.model('Retiro').countDocuments();
    this.id_retiro = `RET-${String(count + 1).padStart(6, '0')}`;
  }
});

export default mongoose.model('Retiro', retiroSchema);