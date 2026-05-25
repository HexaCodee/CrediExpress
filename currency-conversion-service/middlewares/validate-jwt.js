import jwt from 'jsonwebtoken';

export const validateJWT = (req, res, next) => {
    const jwtConfig = {
        secret: process.env.JWT_SECRET,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
    };

    if (!jwtConfig.secret) {
        return res.status(500).json({
            success: false,
            message: 'Error de configuración en el servidor',
            error: 'MISSING_JWT_SECRET'
        });
    }

    const token = req.header('x-token') || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado: No se proporcionó un token',
            error: 'MISSING_TOKEN',
        });
    }

    try {
        const verifyOptions = {};
        if (jwtConfig.issuer) verifyOptions.issuer = jwtConfig.issuer;
        if (jwtConfig.audience) verifyOptions.audience = jwtConfig.audience;

        const decoded = jwt.verify(token, jwtConfig.secret, verifyOptions);

        req.user = {
            id: decoded.sub || decoded.uid,
            role: decoded.role || 'CLIENT',
            name: decoded.name || 'User'
        };

        next();
    } catch (error) {
        // Try to decode token without verifying to inspect header/payload for debugging
        let decodedSafe = null;
        try {
            decodedSafe = jwt.decode(token, { complete: true });
        } catch (e) {
            // ignore decode errors
        }

        console.error('JWT verification failed:', {
            name: error?.name,
            message: error?.message,
            tokenPreview: token ? `${token.substring(0, 10)}...` : null,
            decoded: decodedSafe ? {
                header: decodedSafe.header,
                payload: decodedSafe.payload,
            } : null,
            expected: {
                issuer: jwtConfig.issuer || null,
                audience: jwtConfig.audience || null,
                secretLoaded: !!jwtConfig.secret,
                secretLength: jwtConfig.secret ? jwtConfig.secret.length : 0,
            }
        });
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'La sesión ha expirado, por favor inicia sesión de nuevo',
                error: 'TOKEN_EXPIRED',
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Token inválido',
            error: 'INVALID_TOKEN',
        });
    }
};
