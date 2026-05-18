
import Service from './service.model.js';

export const createService = async (request, response) => {
    try {
        const { nombre_servicio, descripcion_servicio, puntos_requeridos } = request.body;

        const existente = await Service.findOne({
            nombre_servicio: nombre_servicio?.trim(),
            isActive: true
        });
        if (existente) {
            return response.status(409).json({
                success: false,
                message: 'Ya existe un servicio activo con ese nombre'
            });
        }

        const service = new Service({ nombre_servicio, descripcion_servicio, puntos_requeridos });
        await service.save();

        return response.status(201).json({
            success: true,
            message: 'Servicio creado exitosamente',
            data: service
        });

    } catch (error) {
        console.error('Error en createService:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al crear el servicio',
            error: error.message
        });
    }
};

export const getServices = async (request, response) => {
    try {
        const { page = 1, limit = 10, isActive, puntos_max, puntos_min } = request.query;

        const filter = {};
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (puntos_min !== undefined) filter.puntos_requeridos = { $gte: Number(puntos_min) };
        if (puntos_max !== undefined) {
            filter.puntos_requeridos = {
                ...filter.puntos_requeridos,
                $lte: Number(puntos_max)
            };
        }

        const [services, total] = await Promise.all([
            Service.find(filter)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ puntos_requeridos: 1 }),
            Service.countDocuments(filter)
        ]);

        return response.status(200).json({
            success: true,
            data: services,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error en getServices:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener los servicios',
            error: error.message
        });
    }
};

export const updateService = async (request, response) => {
    try {
        const { id } = request.params;
        const { nombre_servicio, descripcion_servicio, puntos_requeridos } = request.body;

        const service = await Service.findById(id);
        if (!service) {
            return response.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        if (!service.isActive) {
            return response.status(400).json({
                success: false,
                message: 'No se puede modificar un servicio inactivo'
            });
        }

        if (nombre_servicio !== undefined) service.nombre_servicio = nombre_servicio;
        if (descripcion_servicio !== undefined) service.descripcion_servicio = descripcion_servicio;
        if (puntos_requeridos !== undefined) service.puntos_requeridos = puntos_requeridos;

        await service.save();

        return response.status(200).json({
            success: true,
            message: 'Servicio actualizado exitosamente',
            data: service
        });

    } catch (error) {
        console.error('Error en updateService:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al actualizar el servicio',
            error: error.message
        });
    }
};
export const deleteService = async (request, response) => {
    try {
        const { id } = request.params;

        const service = await Service.findById(id);
        if (!service) {
            return response.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        if (!service.isActive) {
            return response.status(400).json({
                success: false,
                message: 'El servicio ya se encuentra desactivado'
            });
        }

        service.isActive = false;
        await service.save();

        return response.status(200).json({
            success: true,
            message: 'Servicio desactivado exitosamente',
            data: {
                _id: service._id,
                nombre_servicio: service.nombre_servicio,
                isActive: service.isActive
            }
        });

    } catch (error) {
        console.error('Error en deleteService:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al desactivar el servicio',
            error: error.message
        });
    }
};