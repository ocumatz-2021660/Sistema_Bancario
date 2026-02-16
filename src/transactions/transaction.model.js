'use strict';
 
import mongoose from 'mongoose';
 
const transaccionSchema = mongoose.Schema(
  {
    id_transaccion: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
 
    monto: {
      type: Number,
      required: [true, 'El monto es requerido'],
      min: [0.01, 'El monto debe ser mayor que 0']
    },
 
    fecha_transaccion: {
      type: Date,
      required: true,
      default: Date.now
    },
 
    tipo_transaccion: {
      type: String,
      required: [true, 'El tipo de transacción es requerido'],
      enum: {
        values: ['TRANSFERENCIA', 'DEPOSITO'],
        message: 'Tipo no válido. Debe ser TRANSFERENCIA o DEPOSITO'
      },
      uppercase: true
    },
 
    cuenta_origen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      default: null
    },
 
    cuenta_destinatoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cuenta',
      required: [true, 'La cuenta destinataria es requerida']
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
 
transaccionSchema.index({ tipo_transaccion: 1 });

transaccionSchema.pre('save', async function () {
  if (!this.id_transaccion) {
    const count = await mongoose.model('Transaccion').countDocuments();
    this.id_transaccion = `TRX-${String(count + 1).padStart(6, '0')}`;
  }
});
 
export default mongoose.model('Transaccion', transaccionSchema);