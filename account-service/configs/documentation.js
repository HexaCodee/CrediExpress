const swaggerOptions = {
	swaggerDefinition: {
		openapi: '3.0.0',
		info: {
			title: 'CrediExpress Account Service API',
			version: '1.0.0',
			description: 'Documentacion Swagger para Account Service',
			contact: {
				name: 'Hexacode Team'
			}
		},
		servers: [
			{
				url: `http://127.0.0.1:${process.env.PORT || 3004}/crediExpress/v1`
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
			{ name: 'Accounts', description: 'Gestion de cuentas bancarias' }
		]
	},
	apis: ['./src/accounts/account.routes.js']
};

export default swaggerOptions;
