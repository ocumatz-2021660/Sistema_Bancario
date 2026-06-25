
import Cuenta from '../src/account/account.model.js';
import Service from '../src/services/service.model.js';

export const verificarPuntos = async (request, response, next) => {
    try {
        const currentUserId = request.userId; 

        const { cuenta_canje, servicio_canje } = request.body;

        if (!cuenta_canje || !servicio_canje) {
            return response.status(400).json({
                success: false,
                message: 'Los campos cuenta_canje y servicio_canje son requeridos'
            });
        }

        const cuenta = await Cuenta.findById(cuenta_canje);
        if (!cuenta) {
            return response.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }
        if (!cuenta.isActive) {
            return response.status(400).json({
                success: false,
                message: 'La cuenta se encuentra inactiva o pendiente de aprobación'
            });
        }
        if (cuenta.usuario_cuenta !== currentUserId) {
            return response.status(403).json({ 
                success: false,
                message: 'Acceso denegado. No eres el propietario de esta cuenta.',
            });
        }
        const servicio = await Service.findById(servicio_canje);
        if (!servicio) {
            return response.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }
        if (!servicio.isActive) {
            return response.status(400).json({
                success: false,
                message: 'El servicio no está disponible actualmente'
            });
        }
        if (cuenta.puntos_cuenta < servicio.puntos_requeridos) {
            return response.status(400).json({
                success: false,
                message: 'Puntos insuficientes para canjear este servicio',
                data: {
                    puntos_cuenta: cuenta.puntos_cuenta,
                    puntos_requeridos: servicio.puntos_requeridos,
                    puntos_faltantes: servicio.puntos_requeridos - cuenta.puntos_cuenta
                }
            });
        }
        request.cuenta = cuenta;
        request.servicio = servicio;

        next();

    } catch (error) {
        console.error('Error en verificarPuntos middleware:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al verificar los puntos de la cuenta',
            error: error.message
        });
    }
};