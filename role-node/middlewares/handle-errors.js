export const errorHandler = (err, req, res, next) => {
    console.error(`CrediExpress | Error in Role Server: ${err.message}`);
    console.error(`Stack trace: ${err.stack}`);
    console.error(`Request: ${req.method} ${req.path}`);

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación en los datos del rol',
            errors,
        });
    }

    // Error de duplicado de Mongoose
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `El valor para el campo '${field}' ya está registrado en CrediExpress`,
            error: 'DUPLICATE_FIELD',
        });
    }

    // Error de cast de Mongoose
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'El formato del ID proporcionado no es válido para CrediExpress',
            error: 'INVALID_ID',
        });
    }

    // Errores de JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token de acceso inválido',
            error: 'INVALID_TOKEN',
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'La sesión en CrediExpress ha expirado',
            error: 'TOKEN_EXPIRED',
        });
    }

    // Error personalizado con status
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.code || 'CUSTOM_ERROR',
        });
    }

    // Error genérico (500)
    res.status(500).json({
        success: false,
        message: 'CrediExpress - Ocurrió un error interno en el servicio de roles',
        error: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
            details: err.message,
            stack: err.stack,
        }),
    });
};