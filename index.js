import dotenv from 'dotenv';
import { initServer } from './configs/app.js'; 

//cargar variables de enorno
dotenv.config();

//manejo de errores
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception in Admin Server:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error,promise) =>{
    console.error('Unhandled Rejection at: ' + promise, 'reason:', error);
    process.exit(1);
});

//servidor ensendido
console.log('Starting GestionBancaria Server...');
initServer();