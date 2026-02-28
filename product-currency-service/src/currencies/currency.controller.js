import {
    createCurrencyRecord,
    deleteCurrencyInDB,
    getAllCurrenciesInDB,
    getCurrencyByCodeInDB,
    getCurrencyByIdInDB,
    quoteExchangeInDB,
    updateCurrencyInDB,
    updateExchangeRateInDB,
} from './currency.service.js';

export const getCurrencies = async (req, res, next) => {
    try {
        const currencies = await getAllCurrenciesInDB();

        return res.status(200).json({
            success: true,
            message: 'CrediExpress | Divisas recuperadas exitosamente',
            total: currencies.length,
            currencies,
        });
    } catch (err) {
        next(err);
    }
};

export const getCurrencyById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currency = await getCurrencyByIdInDB(id);

        if (!currency || !currency.status) {
            return res.status(404).json({
                success: false,
                message: 'Divisa no encontrada',
            });
        }

        return res.status(200).json({ success: true, currency });
    } catch (err) {
        next(err);
    }
};

export const getCurrencyByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const currency = await getCurrencyByCodeInDB(code);

        if (!currency || !currency.status) {
            return res.status(404).json({
                success: false,
                message: 'Divisa no encontrada',
            });
        }

        return res.status(200).json({ success: true, currency });
    } catch (err) {
        next(err);
    }
};

export const addCurrency = async (req, res, next) => {
    try {
        const currency = await createCurrencyRecord(req.body);

        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Divisa creada exitosamente',
            currency,
        });
    } catch (err) {
        next(err);
    }
};

export const updateCurrency = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currency = await updateCurrencyInDB(id, req.body);

        if (!currency) {
            return res.status(404).json({
                success: false,
                message: 'Divisa no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Divisa actualizada correctamente',
            currency,
        });
    } catch (err) {
        next(err);
    }
};

export const updateExchangeRate = async (req, res, next) => {
    try {
        const { code } = req.params;
        const { rateToGTQ } = req.body;
        const currency = await updateExchangeRateInDB(code, rateToGTQ);

        if (!currency) {
            return res.status(404).json({
                success: false,
                message: 'Divisa no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tasa de cambio actualizada correctamente',
            currency,
        });
    } catch (err) {
        next(err);
    }
};

export const quoteExchange = async (req, res, next) => {
    try {
        const { from, to, amount } = req.query;
        const quote = await quoteExchangeInDB({ from, to, amount });

        return res.status(200).json({
            success: true,
            quote,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteCurrency = async (req, res, next) => {
    try {
        const { id } = req.params;
        const currency = await deleteCurrencyInDB(id);

        if (!currency) {
            return res.status(404).json({
                success: false,
                message: 'Divisa no encontrada',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Divisa desactivada (eliminación lógica) exitosamente',
        });
    } catch (err) {
        next(err);
    }
};
