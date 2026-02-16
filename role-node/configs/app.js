'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './cors.configuration.js';
import { helmetOptions } from './helmet.configuration.js';
import { dbConnection } from './db.configuration.js';
import { requestLimit } from './rateLimit.configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import roleRoutes from '../src/roles/role.routes.js';
import { seedRoles } from '../src/roles/role.service.js';

const BASE_PATH = '/crediExpress/v1';

const routes = (app) => {
    app.use(`${BASE_PATH}/roles`, roleRoutes);
    
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'CrediExpress Role Service',
        })
    })

    // Manejo de rutas no encontradas (404)
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'CrediExpress - Endpoint no encontrado'
        })
    })
}

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
    app.use(requestLimit);
}

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3002;
    app.set('trust proxy', 1);

    try {
        middlewares(app); // Configuración de seguridad
        await dbConnection(); // Conexión a Mongo
        await seedRoles();    // Creación automática de CLIENT, BANK_ADMIN, CASHIER
        routes(app);          // Carga de rutas
        
        app.use(errorHandler); // Middleware global de errores
        
        app.listen(PORT, () => {
            console.log(`CrediExpress Role Service running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    } catch (err) {
        console.error(`CrediExpress - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
}