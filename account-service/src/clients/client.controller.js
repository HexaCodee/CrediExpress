import { registerClientViaAuthService } from './client.service.js';

export const registerClient = async (req, res, next) => {
    try {
        const result = await registerClientViaAuthService(req.body);

        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Cliente registrado y enviado a verificación de correo',
            data: result,
        });
    } catch (err) {
        next(err);
    }
};