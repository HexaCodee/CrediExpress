const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'CrediExpress Product Currency Service API',
            version: '1.0.0',
            description: 'Documentacion Swagger para Product Currency Service',
            contact: {
                name: 'Hexacode Team'
            }
        },
        servers: [
            {
                url: `http://127.0.0.1:${process.env.PORT || 3008}/crediExpress/v1`
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
            { name: 'Products', description: 'Gestion de productos bancarios' },
            { name: 'Currencies', description: 'Gestion de monedas' }
        ]
    },
    apis: ['./src/products/product.routes.js', './src/currencies/currency.routes.js']
};

export default swaggerOptions;
