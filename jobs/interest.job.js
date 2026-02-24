
import cron from 'node-cron';
//node cron es una biblioteque que permite programar tareas en tiempos determinados mientras el servidor esta activo (waos)
import Cuenta from '../src/account/account.model.js';

const aplicarInteresAhorro = async () => {
    try {
        const resultado = await Cuenta.updateMany(
            { tipo_cuenta: 'AHORRO', isActive: true },//si no es ahorro no funciona
            { $inc: { saldo: 1 } } //incrementa unoo al saldo
        );

        console.log(
            `${new Date().toISOString()} — Cuentas actualizadas: ${resultado.modifiedCount}`
        );
    } catch (error) {
        console.error('Error al aplicar interés de ahorro:', error.message);
    }
};


 // Inicializa el cron 
export const initInteresJob = () => {

    // '* * * * *' → cada minuto (configuar a 30 minutos despues (*/30 * * * *))
    cron.schedule('* * * * *', aplicarInteresAhorro, {
        scheduled: true
    });

    console.log('Generando interés AHORRO iniciado (cada minuto)');
};