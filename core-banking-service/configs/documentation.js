const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Core Banking Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Core Banking Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3007}/crediExpress/v1`
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'CoreBanking', description: 'Operaciones de core banking' }
        ]
    },
    apis: ['./src/core-banking/coreBanking.routes.js']
};

export default swaggerOptions;
