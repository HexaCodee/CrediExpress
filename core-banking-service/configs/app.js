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
import coreBankingRoutes from '../src/core-banking/coreBanking.routes.js';

const BASE_PATH = '/crediExpress/v1';

const routes = (app) => {
    app.use(`${BASE_PATH}/core-banking`, coreBankingRoutes);

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timeStamp: new Date().toISOString(),
            service: 'CrediExpress Core Banking Service',
        });
    });

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'CrediExpress - Endpoint no encontrado'
        });
    });
};

const middlewares = (app) => {
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetOptions));
    app.use(morgan('dev'));
    app.use(requestLimit);
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3007;
    app.set('trust proxy', 1);

    try {
        middlewares(app);
        await dbConnection();
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`CrediExpress Core Banking Service running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    } catch (err) {
        console.error(`CrediExpress - Error al iniciar el servidor: ${err.message}`);
        process.exit(1);
    }
};
