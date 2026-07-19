const allowedOrigins = [
	'http://localhost:3000',
	'http://localhost:3001',
	'http://127.0.0.1:3000',
	'http://127.0.0.1:3001',
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:5222',
	'http://localhost:5062',
	'http://localhost:3002',
	'http://localhost:3003',
	process.env.FRONTEND_URL,
].filter(Boolean);

export const corsOptions = {
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'x-token'],
	optionsSuccessStatus: 200
};
