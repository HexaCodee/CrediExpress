const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Currency Conversion Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Currency Conversion Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3009}/crediExpress/v1`
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
            { name: 'Conversions', description: 'Gestion de conversiones de moneda' }
        ]
    },
    apis: ['./src/conversions/conversion.routes.js']
};

export default swaggerOptions;
