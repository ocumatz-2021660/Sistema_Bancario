import Rol from './rol.model.js';

// Crear un nuevo rol
export const createRol = async (request, response) => {
    try {
        const rolData = request.body;

        // Verificar si el tipo de rol ya existe
        const existingRol = await Rol.findOne({ tipo_rol: rolData.tipo_rol });
        if (existingRol) {
            return response.status(400).json({
                success: false,
                message: 'Este tipo de rol ya existe'
            });
        }

        const rol = new Rol(rolData);
        await rol.save();

        response.status(201).json({
            success: true,
            message: 'Rol creado exitosamente',
            data: rol
        });

    } catch (error) {
        response.status(400).json({
            success: false,
            message: 'Error al crear el rol',
            error: error.message
        });
    }
}

// Obtener todos los roles
export const getRoles = async (request, response) => {
    try {
        const { page = 1, limit = 10, isActive = true } = request.query;

        const filter = { isActive };
        const roles = await Rol.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Rol.countDocuments(filter);

        response.status(200).json({
            success: true,
            data: roles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'Error al obtener los roles',
            error: error.message
        });
    }
}
