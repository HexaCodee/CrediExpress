const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Account Type Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Account Type Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3003}/crediExpress/v1`
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
            { name: 'AccountTypes', description: 'Gestion de tipos de cuenta' }
        ]
    },
    apis: ['./src/account-types/accountType.routes.js']
};

export default swaggerOptions;
