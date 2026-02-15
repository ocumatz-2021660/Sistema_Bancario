import Cuenta from './cuenta.model.js';
import { User } from '../users/user.model.js';

// Crear una nueva cuenta
export const createCuenta = async (request, response) => {
    try {
        const { saldo, tipo_cuenta, usuario_cuenta, alias } = request.body; //Agregar alias en los parámetros

        // Validar que el usuario existe
        const usuarioExiste = await User.findByPk(usuario_cuenta);
        if (!usuarioExiste) {
            return response.status(400).json({
                success: false,
                message: 'El usuario especificado no existe'
            });
        }

        // Validar que el usuario no tenga una cuenta del mismo tipo
        const cuentaExistente = await Cuenta.findOne({
            usuario_cuenta,
            tipo_cuenta: tipo_cuenta.toUpperCase(),
            isActive: true
        });
        if (cuentaExistente) {
            return response.status(400).json({
                success: false,
                message: `El usuario ya tiene una cuenta de tipo ${tipo_cuenta.toUpperCase()}`
            });
        }

        // Validar saldo mínimo
        if (saldo && saldo < 100) {
            return response.status(400).json({
                success: false,
                message: 'El saldo inicial debe ser mínimo de 100Q'
            });
        }

        // Crear la cuenta
        const cuenta = new Cuenta({
            saldo: saldo || 100,
            tipo_cuenta: tipo_cuenta.toUpperCase(),
            usuario_cuenta,
            alias: alias || null, //Asignamos el alias si viene en la petición 
            puntos_cuenta: 0,
            historial_operaciones: []
        });
        // En cuenta.controller.js (dentro de createCuenta)
        await cuenta.save();

        // En lugar de populate, usa el objeto 'usuarioExiste' que ya buscaste antes
        const cuentaConUsuario = cuenta.toObject();
        cuentaConUsuario.usuario_cuenta = usuarioExiste;

        response.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente',
            data: cuentaConUsuario
        });

    } catch (error) {
        response.status(400).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
}

// Obtener todas las cuentas
export const getCuentas = async (request, response) => {
    try {
        const { page = 1, limit = 10, tipo_cuenta, isActive = true } = request.query;

        const filter = { isActive };

        if (tipo_cuenta) {
            filter.tipo_cuenta = tipo_cuenta.toUpperCase();
        }

        const cuentas = await Cuenta.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await Cuenta.countDocuments(filter);

        response.status(200).json({
            success: true,
            data: cuentas,
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
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
}

// Obtener una cuenta específica por ID
export const getCuentaById = async (request, response) => {
    try {
        const { id } = request.params;

        const cuenta = await Cuenta.findById(id);

        if (!cuenta) {
            return response.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }
    // 2. Buscamos en PostgreSQL (Usuario) usando el ID guardado en la cuenta
        // Aquí es donde te daba el error porque "Usuario" no estaba definido
        const usuario = await User.findByPk(cuenta.usuario_cuenta);

        // 3. Unimos los datos manualmente
        const cuentaObj = cuenta.toObject();
        cuentaObj.usuario_cuenta = usuario ? usuario : 'Usuario no encontrado en PostgreSQL';

        response.status(200).json({
            success: true,
            data: cuentaObj
        });

    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'Error al obtener la cuenta',
            error: error.message 
        });
    }
}
// Obtener cuentas por usuario
export const getCuentasByUsuario = async (request, response) => {
    try {
        const { usuario_id } = request.params;

        // Validar que el usuario existe
        const usuarioExiste = await Usuario.findById(usuario_id);
        if (!usuarioExiste) {
            return response.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const cuentas = await Cuenta.find({
            usuario_cuenta: usuario_id,
            isActive: true
        });

        response.status(200).json({
            success: true,
            data: cuentas
        });

    } catch (error) {
        response.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas del usuario',
            error: error.message
        });
    }
}
