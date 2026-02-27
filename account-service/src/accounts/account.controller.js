import {
    changeAccountStatusInDB,
    closeAccountInDB,
    createAccountRecord,
    getAccountByIdInDB,
    getAccountByNumberInDB,
    getAccountsByUserIdInDB,
    getAllAccountsInDB,
    updateAccountInDB
} from './account.service.js';

export const getAccounts = async (req, res, next) => {
    try {
        const accounts = await getAllAccountsInDB();

        return res.status(200).json({
            success: true,
            message: 'CrediExpress | Cuentas recuperadas exitosamente',
            total: accounts.length,
            accounts,
        });
    } catch (err) {
        next(err);
    }
};

export const getAccountById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const account = await getAccountByIdInDB(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        return res.status(200).json({ success: true, account });
    } catch (err) {
        next(err);
    }
};

export const getAccountByNumber = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const account = await getAccountByNumberInDB(accountNumber);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta no encontrada',
            });
        }

        return res.status(200).json({ success: true, account });
    } catch (err) {
        next(err);
    }
};

export const getAccountsByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const accounts = await getAccountsByUserIdInDB(userId);

        return res.status(200).json({
            success: true,
            total: accounts.length,
            accounts,
        });
    } catch (err) {
        next(err);
    }
};

export const addAccount = async (req, res, next) => {
    try {
        const account = await createAccountRecord(req.body);

        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Cuenta creada exitosamente',
            account,
        });
    } catch (err) {
        next(err);
    }
};

export const updateAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const account = await updateAccountInDB(id, req.body);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta actualizada correctamente',
            account,
        });
    } catch (err) {
        next(err);
    }
};

export const blockAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const account = await changeAccountStatusInDB(id, 'BLOCKED');

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta bloqueada correctamente',
            account,
        });
    } catch (err) {
        next(err);
    }
};

export const unblockAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const account = await changeAccountStatusInDB(id, 'ACTIVE');

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta desbloqueada correctamente',
            account,
        });
    } catch (err) {
        next(err);
    }
};

export const closeAccount = async (req, res, next) => {
    try {
        const { id } = req.params;
        const account = await closeAccountInDB(id);

        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta no encontrada' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta cerrada correctamente',
            account,
        });
    } catch (err) {
        next(err);
    }
};
