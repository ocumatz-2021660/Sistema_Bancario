
import Canje from './redeem_service.model.js';
import Cuenta from '../account/account.model.js';

export const canjearServicio = async (request, response) => {
    try {
        const { cuenta, servicio } = request; // ← vienen del middleware

        // Descontar puntos
        cuenta.puntos_cuenta -= servicio.puntos_requeridos;
        await cuenta.save();

        const canje = new Canje({
            cuenta_canje:   cuenta._id,
            servicio_canje: servicio._id,
            estado_canje:   'COMPLETADO'
        });
        await canje.save();

        await canje.populate('servicio_canje', 'descripcion_servicio puntos_requeridos');

        return response.status(201).json({
            success: true,
            message: `¡Canje exitoso! Se descontaron ${servicio.puntos_requeridos} puntos de tu cuenta`,
            data: {
                canje,
                puntos_restantes: cuenta.puntos_cuenta
            }
        });

    } catch (error) {
        console.error('Error en canjearServicio:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al realizar el canje',
            error: error.message
        });
    }
};

export const getCanjesByCuenta = async (request, response) => {
    try {
        const { cuenta_id } = request.params;
        const { page = 1, limit = 10 } = request.query;

        const cuenta = await Cuenta.findById(cuenta_id);
        if (!cuenta) {
            return response.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        const [canjes, total] = await Promise.all([
            Canje.find({ cuenta_canje: cuenta_id })
                .populate('servicio_canje', 'nombre_servicio descripcion_servicio puntos_requeridos')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 }),
            Canje.countDocuments({ cuenta_canje: cuenta_id })
        ]);

        return response.status(200).json({
            success: true,
            data: canjes,
            resumen: {
                total_canjes: total,
                puntos_actuales: cuenta.puntos_cuenta
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error en getCanjesByCuenta:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener el historial de canjes',
            error: error.message
        });
    }
};

export const getAllCanjes = async (request, response) => {
    try {
        const { page = 1, limit = 10, servicio_id } = request.query;

        const filter = {};
        if (servicio_id) filter.servicio_canje = servicio_id;

        const [canjes, total] = await Promise.all([
            Canje.find(filter)
                .populate('servicio_canje', 'nombre_servicio puntos_requeridos')
                .populate('cuenta_canje', 'no_cuenta tipo_cuenta usuario_cuenta')
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 }),
            Canje.countDocuments(filter)
        ]);

        return response.status(200).json({
            success: true,
            data: canjes,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error en getAllCanjes:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener los canjes',
            error: error.message
        });
    }
};
//solo en el minuto de realizarlo
export const cancelarCanje = async (request, response) => {
    try {
        const { canjeParaCancelar } = request; // ← viene del middleware

        // Devolver los puntos a la cuenta
        const cuenta = await Cuenta.findById(canjeParaCancelar.cuenta_canje);
        const servicio = await canjeParaCancelar.populate('servicio_canje', 'puntos_requeridos');

        cuenta.puntos_cuenta += servicio.servicio_canje.puntos_requeridos;
        await cuenta.save();

        canjeParaCancelar.estado_canje = 'CANCELADO';
        await canjeParaCancelar.save();

        return response.status(200).json({
            success: true,
            message: 'Canje cancelado exitosamente. Los puntos han sido devueltos.',
            data: {
                canje: canjeParaCancelar,
                puntos_devueltos: servicio.servicio_canje.puntos_requeridos,
                puntos_actuales: cuenta.puntos_cuenta
            }
        });

    } catch (error) {
        console.error('Error en cancelarCanje:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al cancelar el canje',
            error: error.message
        });
    }
};
