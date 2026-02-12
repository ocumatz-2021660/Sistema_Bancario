import Usuario from './usuario.model.js';
import Rol from '../roles/rol.model.js';

// Registrar nuevo usuario
export const createUsuario = async (request, response) => {
    try {
        const usuarioData = request.body;

        // Verificar si el username ya existe
        const existingUsername = await Usuario.findOne({ username: usuarioData.username });
        if (existingUsername) {
            return response.status(400).json({
                success: false,
                message: 'El username ya está en uso'
            });
        }

        // Verificar si el email ya existe
        const existingEmail = await Usuario.findOne({ email_user: usuarioData.email_user });
        if (existingEmail) {
            return response.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Verificar si el DPI/CUI ya existe
        const existingDPI = await Usuario.findOne({ dpi_cui: usuarioData.dpi_cui });
        if (existingDPI) {
            return response.status(400).json({
                success: false,
                message: 'El DPI/CUI ya está registrado'
            });
        }

        // Verificar que el rol existe
        const rolExists = await Rol.findById(usuarioData.rol);
        if (!rolExists) {
            return response.status(400).json({
                success: false,
                message: 'El rol especificado no existe'
            });
        }

        // Crear el usuario (el password se hashea automáticamente)
        const usuario = new Usuario(usuarioData);
        await usuario.save();

        // Cargar el rol para mostrarlo en la respuesta
        await usuario.populate('rol');

        response.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente. Estado: PENDIENTE',
            data: usuario
        });

    } catch (error) {
        response.status(400).json({
            success: false,
            message: 'Error al crear el usuario',
            error: error.message
        });
    }
}

// Obtener todos los usuarios
export const getUsuarios = async (request, response) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            estado, 
            estadoFavorito,
            isActive = true 
        } = request.query;

        const filter = { isActive };
        
        if (estado) filter.estado = estado.toUpperCase();
        if (estadoFavorito) filter.estadoFavorito = estadoFavorito.toUpperCase();

        const usuarios = await Usuario.find(filter)
            .populate('rol')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Usuario.countDocuments(filter);

        response.status(200).json({
            success: true,
            data: usuarios,
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
            message: 'Error al obtener los usuarios',
            error: error.message
        });
    }
}
