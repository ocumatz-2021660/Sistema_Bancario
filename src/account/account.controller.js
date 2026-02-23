// cuenta.controller.js
import Cuenta from './account.model.js';
import Solicitud from '../request_accounts/request_accounts.model.js';
import { User } from '../users/user.model.js';
import { enrichWithUser } from '../../helpers/enrich-with-user.js';

//cuenta inactiva y genera solicitud pendiente
export const createCuenta = async (request, response) => {
    try {
        const { saldo, tipo_cuenta, usuario_cuenta } = request.body;

        // Validar que el usuario existe en PostgreSQL
        const usuarioExiste = await User.findByPk(usuario_cuenta, {
            attributes: ['Id', 'Name', 'Surname', 'Username', 'Email']
        });
        if (!usuarioExiste) {
            return response.status(404).json({
                success: false,
                message: 'El usuario especificado no existe'
            });
        }

        //Validar que no tenga ya una cuenta del mismo tipo
        const cuentaExistente = await Cuenta.findOne({
            usuario_cuenta,
            tipo_cuenta: tipo_cuenta.toUpperCase(),
        });
        if (cuentaExistente) {
            return response.status(409).json({
                success: false,
                message: `El usuario ya tiene una cuenta de tipo ${tipo_cuenta.toUpperCase()} o una solicitud pendiente`
            });
        }

        //Validar saldo mínimo
        if (saldo !== undefined && saldo < 100) {
            return response.status(400).json({
                success: false,
                message: 'El saldo inicial debe ser mínimo de 100Q'
            });
        }

        //Crear la cuenta como INACTIVA (espera aprobación del admin en solicitudes)
        const cuenta = new Cuenta({
            saldo: saldo ?? 100,
            tipo_cuenta: tipo_cuenta.toUpperCase(),
            usuario_cuenta,
            puntos_cuenta: 0,
            isActive: false
        });
        await cuenta.save();

        // 5. Crear solicitud PENDIENTE (automatico vro)
        const solicitud = new Solicitud({
            estado_solicitud: 'PENDIENTE',
            cuenta: cuenta._id,
        });
        await solicitud.save();

        // join manual (helper we)
        const cuentaConUsuario = await enrichWithUser(cuenta, 'usuario_cuenta');

        return response.status(201).json({
            success: true,
            message: 'Cuenta creada exitosamente. Pendiente de aprobación por un administrador.',
            data: {
                cuenta: cuentaConUsuario,
                solicitud: {
                    _id: solicitud._id,
                    id_solicitud: solicitud.id_solicitud,
                    estado_solicitud: solicitud.estado_solicitud,
                    fecha_solicitud: solicitud.fecha_solicitud,
                }
            }
        });

    } catch (error) {
        console.error('Error en createCuenta:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

export const getCuentas = async (request, response) => {
    try {
        const { page = 1, limit = 10, tipo_cuenta, isActive } = request.query;

        const filter = {};
        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }
        if (tipo_cuenta) {
            filter.tipo_cuenta = tipo_cuenta.toUpperCase();
        }

        const [cuentas, total] = await Promise.all([
            Cuenta.find(filter)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .sort({ createdAt: -1 }),
            Cuenta.countDocuments(filter)
        ]);

        const cuentasConUsuarios = await enrichWithUser(cuentas, 'usuario_cuenta');

        return response.status(200).json({
            success: true,
            data: cuentasConUsuarios,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error en getCuentas:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
};

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

        const cuentaConUsuario = await enrichWithUser(cuenta, 'usuario_cuenta');

        return response.status(200).json({
            success: true,
            data: cuentaConUsuario
        });

    } catch (error) {
        console.error('Error en getCuentaById:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener la cuenta',
            error: error.message
        });
    }
};


export const getCuentasByUsuario = async (request, response) => {
    try {
        const { usuario_id } = request.params;

        const usuarioExiste = await User.findByPk(usuario_id, {
            attributes: ['Id', 'Name', 'Surname', 'Username', 'Email']
        });
        if (!usuarioExiste) {
            return response.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const cuentas = await Cuenta.find({ usuario_cuenta: usuario_id });
        const cuentasConUsuario = await enrichWithUser(cuentas, 'usuario_cuenta');

        return response.status(200).json({
            success: true,
            message: 'Cuentas del usuario obtenidas exitosamente',
            data: cuentasConUsuario
        });

    } catch (error) {
        console.error('Error en getCuentasByUsuario:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas del usuario',
            error: error.message
        });
    }
};

//solo se actualiza el saldo 
export const updateSaldo = async (request, response) => {
    try {
        const { id } = request.params;
        const { saldo } = request.body;

        if (saldo === undefined || saldo === null) {
            return response.status(400).json({
                success: false,
                message: 'El campo "saldo" es requerido'
            });
        }

        if (typeof saldo !== 'number') {
            return response.status(400).json({
                success: false,
                message: 'El saldo debe ser un número'
            });
        }

        if (saldo < 100) {
            return response.status(400).json({
                success: false,
                message: 'El saldo mínimo permitido es de 100Q'
            });
        }

        const cuenta = await Cuenta.findById(id);
        if (!cuenta) {
            return response.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (!cuenta.isActive) {
            return response.status(400).json({
                success: false,
                message: 'No se puede modificar una cuenta inactiva o pendiente de aprobación'
            });
        }

        cuenta.saldo = saldo;
        await cuenta.save();

        const cuentaConUsuario = await enrichWithUser(cuenta, 'usuario_cuenta');

        return response.status(200).json({
            success: true,
            message: 'Saldo actualizado exitosamente',
            data: cuentaConUsuario
        });

    } catch (error) {
        console.error('Error en updateSaldo:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al actualizar el saldo',
            error: error.message
        });
    }
};

//desactiva la cuenta (estado)
export const deleteCuenta = async (request, response) => {
    try {
        const { id } = request.params;

        const cuenta = await Cuenta.findById(id);
        if (!cuenta) {
            return response.status(404).json({
                success: false,
                message: 'Cuenta no encontrada'
            });
        }

        if (!cuenta.isActive) {
            return response.status(400).json({
                success: false,
                message: 'La cuenta ya se encuentra desactivada'
            });
        }

        cuenta.isActive = false;
        await cuenta.save();

        return response.status(200).json({
            success: true,
            message: 'Cuenta desactivada exitosamente',
            data: {
                _id: cuenta._id,
                no_cuenta: cuenta.no_cuenta,
                tipo_cuenta: cuenta.tipo_cuenta,
                isActive: cuenta.isActive
            }
        });

    } catch (error) {
        console.error('Error en deleteCuenta:', error);
        return response.status(500).json({
            success: false,
            message: 'Error al desactivar la cuenta',
            error: error.message
        });
    }
};