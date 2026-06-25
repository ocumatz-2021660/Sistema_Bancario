import mongoose from 'mongoose';

const cuentaSchema = mongoose.Schema(
  {
    no_cuenta: {
      type: String,
      unique: true,
    },
    saldo: {
      type: Number,
      required: true,
      default: 0,
    },
    tipo_cuenta: {
      type: String,
      required: true,
      enum: ['AHORRO', 'MONETARIA'],
      uppercase: true,
    },
    puntos_cuenta: {
      type: Number,
      default: 0,
      min: [0, 'Los puntos no pueden ser negativos'],
    },
    usuario_cuenta: {
      type: String,
      ref: 'Usuario',
      required: true,
    },
    alias: {
      type: String,
      trim: true,
      default: null,
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

export default mongoose.model('Cuenta', cuentaSchema);
