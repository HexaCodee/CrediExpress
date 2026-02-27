import mongoose from 'mongoose';

export const dbConnection = async () => {
	try {
		mongoose.connection.on('error', () => {
			console.error('CrediExpress | Mongo DB | Error de conexión');
		});
		mongoose.connection.on('connecting', () => {
			console.log('CrediExpress | Mongo DB | Intentando conectar...');
		});
		mongoose.connection.on('connected', () => {
			console.log('CrediExpress | Mongo DB | Conectado a MongoDB');
		});
		mongoose.connection.on('open', () => {
			console.log('CrediExpress | Mongo DB | Conexión abierta');
		});

		await mongoose.connect(process.env.URI_MONGODB, {
			serverSelectionTimeoutMS: 5000,
			maxPoolSize: 10,
		});
	} catch (err) {
		console.error(`CrediExpress | Error al conectar la DB: ${err.message}`);
		process.exit(1);
	}
};

const gracefulShutdown = async (signal) => {
	console.log(`\nCrediExpress | Mongo DB | Señal ${signal} recibida.`);
	try {
		await mongoose.disconnect();
		console.log('CrediExpress | Mongo DB | Conexión cerrada');
		process.exit(0);
	} catch (err) {
		process.exit(1);
	}
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
