const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Bank Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Bank Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3006}/crediExpress/v1`
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
            { name: 'BankProfiles', description: 'Gestion de perfiles bancarios' }
        ]
    },
    apis: ['./src/bank-accounts/bankAccount.routes.js']
};

export default swaggerOptions;
