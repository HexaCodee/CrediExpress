import {
    adjustDepositAmountInDB,
    applyDepositInDB,
    createFavoriteAccountInDB,
    deleteFavoriteAccountInDB,
    getAccountOverviewInDB,
    getAllOperationalAccountsInDB,
    listFavoriteAccountsInDB,
    getHistoryByAccountInDB,
    getOperationalAccountInDB,
    getRecentMovementsByAccountInDB,
    getTopAccountsByMovementsInDB,
    getTransferUsageTodayInDB,
    quickTransferByFavoriteInDB,
    registerOperationalAccountInDB,
    revertDepositInDB,
    transferInDB,
    updateFavoriteAccountInDB,
} from './coreBanking.service.js';

export const registerOperationalAccount = async (req, res, next) => {
    try {
        const account = await registerOperationalAccountInDB(req.body);
        return res.status(201).json({
            success: true,
            message: 'Cuenta operativa registrada en core banking',
            account,
        });
    } catch (err) {
        next(err);
    }
};

export const getOperationalAccounts = async (req, res, next) => {
    try {
        const accounts = await getAllOperationalAccountsInDB();
        return res.status(200).json({ success: true, total: accounts.length, accounts });
    } catch (err) {
        next(err);
    }
};

export const getOperationalAccount = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const account = await getOperationalAccountInDB(accountNumber);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Cuenta operativa no encontrada' });
        }

        return res.status(200).json({ success: true, account });
    } catch (err) {
        next(err);
    }
};

export const createDeposit = async (req, res, next) => {
    try {
        const { accountNumber, amount, description } = req.body;
        const result = await applyDepositInDB({
            accountNumber,
            amount,
            description,
            createdByUserId: req.user?.id || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Depósito aplicado exitosamente',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const updateDepositAmount = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const { amount } = req.body;
        const result = await adjustDepositAmountInDB({ transactionId, newAmount: amount });

        return res.status(200).json({
            success: true,
            message: 'Monto de depósito ajustado exitosamente',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const reverseDeposit = async (req, res, next) => {
    try {
        const { transactionId } = req.params;
        const result = await revertDepositInDB(transactionId);

        return res.status(200).json({
            success: true,
            message: 'Depósito revertido exitosamente',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const createTransfer = async (req, res, next) => {
    try {
        const { fromAccountNumber, toAccountNumber, amount, description } = req.body;
        const result = await transferInDB({
            fromAccountNumber,
            toAccountNumber,
            amount,
            description,
            createdByUserId: req.user?.id || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Transferencia aplicada exitosamente',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const createFavoriteAccount = async (req, res, next) => {
    try {
        const favorite = await createFavoriteAccountInDB({
            ownerUserId: req.user?.id,
            accountNumber: req.body.accountNumber,
            accountType: req.body.accountType,
            alias: req.body.alias,
        });

        return res.status(201).json({
            success: true,
            message: 'Cuenta agregada a favoritos',
            favorite,
        });
    } catch (err) {
        next(err);
    }
};

export const getFavoriteAccounts = async (req, res, next) => {
    try {
        const favorites = await listFavoriteAccountsInDB(req.user?.id);
        return res.status(200).json({ success: true, total: favorites.length, favorites });
    } catch (err) {
        next(err);
    }
};

export const updateFavoriteAccount = async (req, res, next) => {
    try {
        const { favoriteId } = req.params;
        const favorite = await updateFavoriteAccountInDB({
            favoriteId,
            ownerUserId: req.user?.id,
            alias: req.body.alias,
            accountType: req.body.accountType,
        });

        return res.status(200).json({
            success: true,
            message: 'Favorito actualizado',
            favorite,
        });
    } catch (err) {
        next(err);
    }
};

export const removeFavoriteAccount = async (req, res, next) => {
    try {
        const { favoriteId } = req.params;
        await deleteFavoriteAccountInDB({ favoriteId, ownerUserId: req.user?.id });

        return res.status(200).json({
            success: true,
            message: 'Favorito eliminado',
        });
    } catch (err) {
        next(err);
    }
};

export const createQuickTransferFromFavorite = async (req, res, next) => {
    try {
        const { favoriteId } = req.params;
        const { fromAccountNumber, amount, description } = req.body;

        const result = await quickTransferByFavoriteInDB({
            favoriteId,
            ownerUserId: req.user?.id,
            fromAccountNumber,
            amount,
            description,
            createdByUserId: req.user?.id || null,
        });

        return res.status(201).json({
            success: true,
            message: 'Transferencia rápida aplicada exitosamente',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const getHistoryByAccount = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const { limit } = req.query;
        const history = await getHistoryByAccountInDB(accountNumber, limit);

        return res.status(200).json({
            success: true,
            total: history.length,
            history,
        });
    } catch (err) {
        next(err);
    }
};

export const getRecentMovementsByAccount = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const { limit } = req.query;
        const history = await getRecentMovementsByAccountInDB(accountNumber, limit || 5);

        return res.status(200).json({
            success: true,
            total: history.length,
            history,
        });
    } catch (err) {
        next(err);
    }
};

export const getTransferUsageToday = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const usage = await getTransferUsageTodayInDB(accountNumber);

        return res.status(200).json({
            success: true,
            usage,
        });
    } catch (err) {
        next(err);
    }
};

export const getTopAccountsByMovements = async (req, res, next) => {
    try {
        const { order = 'desc', limit = 10 } = req.query;
        const accounts = await getTopAccountsByMovementsInDB({ order, limit: Number(limit) });

        return res.status(200).json({
            success: true,
            message: `Cuentas ordenadas por cantidad de movimientos (${(order || 'desc').toLowerCase() === 'asc' ? 'ascendente' : 'descendente'})`,
            total: accounts.length,
            accounts,
        });
    } catch (err) {
        next(err);
    }
};

export const getAccountOverview = async (req, res, next) => {
    try {
        const { accountNumber } = req.params;
        const overview = await getAccountOverviewInDB(accountNumber);

        return res.status(200).json({
            success: true,
            message: 'Resumen de cuenta obtenido correctamente',
            overview,
        });
    } catch (err) {
        next(err);
    }
};
