import Service from './service.model.js';
import Cuenta from '../account/account.model.js';

export const saveService = async (req, res) => {
    try {
        const { descripcion_servicio, puntos_minimos_servicio, cuenta_servicio } = req.body;

        // 1. Buscar la cuenta del cliente
        const cuenta = await Cuenta.findById(cuenta_servicio);

        if (!cuenta || !cuenta.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada o inactiva'
            });
        }

        // 2. Validar puntos (Lógica: puntos_cuenta debe ser >= puntos_minimos)
        if (cuenta.puntos_cuenta < puntos_minimos_servicio) {
            return res.status(400).json({
                success: false,
                message: `Puntos insuficientes. Tienes ${cuenta.puntos_cuenta} y necesitas ${puntos_minimos_servicio}`
            });
        }

        // 3. Restar los puntos a la cuenta y salvar cambios
        cuenta.puntos_cuenta -= puntos_minimos_servicio;
        await cuenta.save();

        // 4. Crear el registro del servicio
        const newService = new Service({
            descripcion_servicio,
            puntos_minimos_servicio,
            cuenta_servicio
        });
        await newService.save();

        res.status(201).json({
            success: true,
            message: 'Servicio otorgado y puntos descontados',
            data: newService,
            puntos_restantes: cuenta.puntos_cuenta
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al procesar el servicio',
            error: error.message
        });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { descripcion_servicio } = req.body;

        // Buscar y actualizar solo la descripción del servicio
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { descripcion_servicio },
            { new: true }
        );

        if (!updatedService) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Servicio actualizado correctamente',
            data: updatedService
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el servicio',
            error: error.message
        });
    }
};

export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Buscar el servicio para saber cuántos puntos devolver y a qué cuenta
        const service = await Service.findById(id);
        
        if (!service || !service.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Servicio no encontrado o ya está inactivo'
            });
        }

        // 2. Devolver los puntos a la cuenta vinculada antes de darle al eliiminar
        const cuenta = await Cuenta.findById(service.cuenta_servicio);
        if (cuenta) {
            cuenta.puntos_cuenta += service.puntos_minimos_servicio;
            await cuenta.save();
        }

        // 3. Eliminación 
        service.isActive = false;
        await service.save();

        res.status(200).json({
            success: true,
            message: 'Servicio eliminado y puntos revertidos a la cuenta',
            puntos_devueltos: service.puntos_minimos_servicio,
            nuevo_saldo_puntos: cuenta ? cuenta.puntos_cuenta : 'Cuenta no encontrada'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el servicio',
            error: error.message
        });
    }
};