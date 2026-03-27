// solicitud.controller.js
import Solicitud from './request_accounts.model.js';
import Cuenta from '../account/account.model.js';
import { enrichWithUser } from '../../helpers/enrich-with-user.js';

//solo los admin las ven
export const getSolicitudes = async (req, res) => {
    try {
        const { page = 1, limit = 10, estado_solicitud } = req.query;

        const filter = {};
        if (estado_solicitud) {
            filter.estado_solicitud = estado_solicitud.toUpperCase();
        }

        const [solicitudes, total] = await Promise.all([
            Solicitud.find(filter)
                .populate('cuenta')               // join a cuenta (mongoose)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 }),
            Solicitud.countDocuments(filter)
        ]);

        const solicitudesEnriquecidas = await Promise.all(
            solicitudes.map(async (sol) => {
                const solObj = sol.toObject();
                if (solObj.cuenta) {
                    solObj.cuenta = await enrichWithUser(solObj.cuenta, 'usuario_cuenta');
                }
                return solObj;
            })
        );

        return res.status(200).json({
            success: true,
            data: solicitudesEnriquecidas,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error en getSolicitudes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes',
            error: error.message
        });
    }
};

export const getSolicitudById = async (req, res) => {
    try {
        const { id } = req.params;

        const solicitud = await Solicitud.findById(id).populate('cuenta');
        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        const solObj = solicitud.toObject();
        if (solObj.cuenta) {
            solObj.cuenta = await enrichWithUser(solObj.cuenta, 'usuario_cuenta');
        }

        return res.status(200).json({
            success: true,
            data: solObj
        });

    } catch (error) {
        console.error('Error en getSolicitudById:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener la solicitud',
            error: error.message
        });
    }
};

//actualizar estado de la solicitud en el header (aprovar)
export const aprobarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }

        if (solicitud.estado_solicitud !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: `La solicitud ya fue ${solicitud.estado_solicitud.toLowerCase()}. Solo se pueden aprobar solicitudes PENDIENTES`
            });
        }
        solicitud.estado_solicitud = 'APROBADA';
        await solicitud.save();

        //Activar la cuenta
        const cuenta = await Cuenta.findByIdAndUpdate(
            solicitud.cuenta,
            { isActive: true },
            { new: true }
        );

        if (!cuenta) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta asociada no encontrada'
            });
        }
        //join helper
        const cuentaConUsuario = await enrichWithUser(cuenta, 'usuario_cuenta');

        return res.status(200).json({
            success: true,
            message: 'Solicitud aprobada. Cuenta activada exitosamente.',
            data: {
                solicitud: {
                    _id: solicitud._id,
                    id_solicitud: solicitud.id_solicitud,
                    estado_solicitud: solicitud.estado_solicitud,
                },
                cuenta: cuentaConUsuario
            }
        });

    } catch (error) {
        console.error('Error en aprobarSolicitud:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al aprobar la solicitud',
            error: error.message
        });
    }
};
//actualizar estado de la solicitud en el header (rechazada)
export const rechazarSolicitud = async (req, res) => {
    try {
        const { id } = req.params;

        const solicitud = await Solicitud.findById(id);
        if (!solicitud) {
            return res.status(404).json({
                success: false,
                message: 'Solicitud no encontrada'
            });
        }
        //evitamos cambiar solicitudes ya aceptadas anteriormente (para desactivarlas es otro endpoint)
        if (solicitud.estado_solicitud !== 'PENDIENTE') {
            return res.status(400).json({
                success: false,
                message: `La solicitud ya fue ${solicitud.estado_solicitud.toLowerCase()}. Solo se pueden rechazar solicitudes PENDIENTES`
            });
        }

        // ID de la cuenta antes de eliminarla
        const cuentaId = solicitud.cuenta;
        solicitud.estado_solicitud = 'RECHAZADA';
        await solicitud.save();
        await Cuenta.findByIdAndDelete(cuentaId);

        return res.status(200).json({
            success: true,
            message: 'Solicitud rechazada. Cuenta eliminada.',
            data: {
                solicitud: {
                    _id: solicitud._id,
                    id_solicitud: solicitud.id_solicitud,
                    estado_solicitud: solicitud.estado_solicitud,
                },
                cuentaEliminada: cuentaId
            }
        });

    } catch (error) {
        console.error('Error en rechazarSolicitud:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al rechazar la solicitud',
            error: error.message
        });
    }
};