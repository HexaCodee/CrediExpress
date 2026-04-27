const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Role Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Role Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3002}/crediExpress/v1`
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
            { name: 'Roles', description: 'Gestion de roles y permisos' }
        ]
    },
    apis: ['./src/roles/role.routes.js']
};

export default swaggerOptions;
