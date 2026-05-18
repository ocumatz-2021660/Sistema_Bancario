import Transaccion from '../src/transactions/transaction.model.js'; 
import Cuenta from '../src/account/account.model.js';

export const canCancelTransaction = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const transaccion = await Transaccion.findById(id);

        if (!transaccion) {
            return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
        }

        const ahora = new Date();
        const tiempoTranscurrido = (ahora - transaccion.createdAt) / 1000; 

        if (tiempoTranscurrido > 60) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar: el tiempo límite de 1 minuto ha expirado' 
            });
        }

        req.transaccionParaEliminar = transaccion;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al validar tiempo de eliminación', error: error.message });
    }
};