/**
 * Middleware para autorizar por roles específicos
 */
export const isAdminRole = (req, res, next) => {
    if (!req.user) {
        return res.status(500).json({
            success: false,
            message: 'Se quiere verificar el role sin validar el token primero'
        });
    }

    const { role, name } = req.user;

    if (role !== 'BANK_ADMIN') {
        return res.status(401).json({
            success: false,
            message: `CrediExpress | ${name} no es administrador - No tiene acceso a este recurso`
        });
    }

    next();
};

export const hasAnyRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({
                success: false,
                message: 'Se quiere verificar el role sin validar el token primero'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(401).json({
                success: false,
                message: `El servicio requiere uno de estos roles: ${roles}`
            });
        }
        next();
    };
};