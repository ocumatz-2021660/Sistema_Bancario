
import Canje from '../src/redeem_service/redeem_service.model.js';

export const canCancelCanje = async (req, res, next) => {
    try {
        const { id } = req.params;

        const canje = await Canje.findById(id);
        if (!canje) {
            return res.status(404).json({
                success: false,
                message: 'Canje no encontrado'
            });
        }

        if (canje.estado_canje === 'CANCELADO') {
            return res.status(400).json({
                success: false,
                message: 'El canje ya fue cancelado anteriormente'
            });
        }

        const ahora = new Date();
        const tiempoTranscurrido = (ahora - canje.createdAt) / 1000; // en segundos

        if (tiempoTranscurrido > 60) {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar: el tiempo límite de 1 minuto ha expirado',
                data: {
                    segundos_transcurridos: Math.floor(tiempoTranscurrido),
                    limite: 60
                }
            });
        }
        req.canjeParaCancelar = canje;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al validar tiempo de cancelación',
            error: error.message
        });
    }
};