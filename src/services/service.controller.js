import Service from './service.model.js';
import Cuenta from '../cuentas/cuenta.model.js'; 

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