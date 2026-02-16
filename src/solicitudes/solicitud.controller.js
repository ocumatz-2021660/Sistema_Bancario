import Solicitud from './solicitud.model.js';

export const createSolicitud = async (req, res) => {
    try {

        const solicitudData = req.body;

        const solicitud = new Solicitud(solicitudData);
        await solicitud.save();

        res.status(201).json({
            success: true,
            message: 'Solicitud creada exitosamente',
            solicitud
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error crear la solicitud',
            error: error.message
        });
    }
}

export const getSolicitudes = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true, estado_solicitud, cuenta } = req.query;

        //filtro
        const filter = { isActive };

        if (estado_solicitud) {
            filter.estado_solicitud = estado_solicitud;
        }

        if (cuenta) {
            filter.cuenta = cuenta;
        }

        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        }

        const solicitudes = await Solicitud.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Solicitud.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: solicitudes,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las solicitudes',
            error: error.message
        })
    }
}