'use strict';

import mongoose from "mongoose";

//funcion asincrona (de escucha)
export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            //error por si no se puede conectar al db
            console.log(`Error en la conexión a la db: ${error}`);
            mongoose.disconnect(); //se desconecta
        });
        mongoose.connection.on('connecting', () => {            
            console.log(`MongoDB | intentando conectar a mongoDB`);            
        });
        mongoose.connection.on('connected', () => {
            console.log(`MongoDB | conectado a mongoDB`);            
        });
        mongoose.connection.on('open', () => {
            console.log(`MongoDB | conectado a la base de datos kinalsports`);            
        });
        mongoose.connection.on('reconnect', () => {
            console.log(`MongoDB | reconectando a mongoDB`);        
        });
        mongoose.connection.on('disconnected', () => {
            console.log(`MongoDB | desconectado de mongoDB`);            
        });
        //conexion

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000, //tiempo de espera para la conexion
            maxPoolSize: 10, //numero maximo de conexiones en el pool
        })
            
    } catch (error) {
        console.log(`Error al conectar la db: ${error}`);

    }
}


//fucnion cuando se apague el servidor (que la bse de datos nunca se qede abierta
//recibe la señal
const gracefulShutdown = async (signal) => {
    console.log(`MongoDB | Received ${signal}. Closing databse connection...`)
    try{
        //se asegura que realmente se cierre la conexion a la base de datos antes de salir del proceso
        await mongoose.connection.close();
        process.exit(0);
    }catch(error){
        console.error(`MongoDB | Error during graceful shutdown:`, error.message);
        process.exit(1);
    }
}
//escucha las señales de terminacion del proceso
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
//reinicios
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));