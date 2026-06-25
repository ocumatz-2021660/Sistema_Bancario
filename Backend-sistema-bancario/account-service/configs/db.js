import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    mongoose.connection.on('error', (error) => {
      console.log(`Error en la conexión a MongoDB: ${error}`);
      mongoose.disconnect();
    });
    mongoose.connection.on('connecting', () => {
      console.log('MongoDB | intentando conectar a mongoDB');
    });
    mongoose.connection.on('connected', () => {
      console.log('MongoDB | conectado a mongoDB');
    });
    mongoose.connection.on('open', () => {
      console.log('MongoDB | conectado a la base de datos');
    });
    mongoose.connection.on('reconnect', () => {
      console.log('MongoDB | reconectando a mongoDB');
    });
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB | desconectado de mongoDB');
    });

    await mongoose.connect(process.env.URI_MONGO, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
  } catch (error) {
    console.log(`Error al conectar MongoDB: ${error}`);
  }
};

const gracefulShutdown = async (signal) => {
  console.log(`MongoDB | Received ${signal}. Closing database connection...`);
  try {
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`MongoDB | Error during graceful shutdown:`, error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
