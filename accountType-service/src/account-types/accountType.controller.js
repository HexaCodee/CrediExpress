import {
    createAccountTypeRecord,
    deleteAccountTypeInDB,
    getAccountTypeByIdInDB,
    getAllAccountTypesInDB,
    updateAccountTypeInDB
} from './accountType.service.js';

export const getAccountTypes = async (req, res, next) => {
    try {
        const accountTypes = await getAllAccountTypesInDB();

        return res.status(200).json({
            success: true,
            message: 'CrediExpress | Tipos de cuenta recuperados exitosamente',
            total: accountTypes.length,
            accountTypes,
        });
    } catch (err) {
        next(err);
    }
};

export const getAccountTypeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const accountType = await getAccountTypeByIdInDB(id);

        if (!accountType || !accountType.status) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cuenta no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            accountType,
        });
    } catch (err) {
        next(err);
    }
};

export const addAccountType = async (req, res, next) => {
    try {
        const accountType = await createAccountTypeRecord(req.body);

        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Tipo de cuenta creado exitosamente',
            accountType,
        });
    } catch (err) {
        next(err);
    }
};

export const updateAccountType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const accountType = await updateAccountTypeInDB(id, req.body);

        if (!accountType) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cuenta no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tipo de cuenta actualizado correctamente',
            accountType,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteAccountType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const accountType = await deleteAccountTypeInDB(id);

        if (!accountType) {
            return res.status(404).json({
                success: false,
                message: 'Tipo de cuenta no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tipo de cuenta desactivado (eliminación lógica) exitosamente',
        });
    } catch (err) {
        next(err);
    }
};
