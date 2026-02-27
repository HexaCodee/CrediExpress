export const errorHandler = (err, req, res, next) => {
    console.error(`CrediExpress | Error in AccountType Server: ${err.message}`);
    console.error(`Request: ${req.method} ${req.path}`);

    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        }));

        return res.status(400).json({
            success: false,
            message: 'Error de validación en los datos del tipo de cuenta',
            errors,
        });
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            success: false,
            message: `El valor para el campo '${field}' ya está registrado en CrediExpress`,
            error: 'DUPLICATE_FIELD',
        });
    }

    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'El formato del ID proporcionado no es válido para CrediExpress',
            error: 'INVALID_ID',
        });
    }

    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err.code || 'CUSTOM_ERROR',
        });
    }

    return res.status(500).json({
        success: false,
        message: 'CrediExpress - Ocurrió un error interno en el servicio de tipos de cuenta',
        error: 'INTERNAL_SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && {
            details: err.message,
            stack: err.stack,
        }),
    });
};
