import {
    convertAndPersistInDB,
    getConversionHistoryInDB,
    getRatesByBaseInDB,
    quoteConversionInDB,
    refreshRatesByBaseInDB,
} from './conversion.service.js';

export const quoteConversion = async (req, res, next) => {
    try {
        const { from, to, amount } = req.query;
        const quote = await quoteConversionInDB({ from, to, amount });

        return res.status(200).json({
            success: true,
            quote,
        });
    } catch (err) {
        next(err);
    }
};

export const convertCurrency = async (req, res, next) => {
    try {
        console.log('CONVERSION REQUEST BODY:', req.body);

        const { from, to, amount, description } = req.body;
        const result = await convertAndPersistInDB({
            from,
            to,
            amount,
            userId: req.user?.id || null,
            description,
        });

        return res.status(201).json({
            success: true,
            message: 'Conversión realizada exitosamente',
            result,
        });
    } catch (error) {
        console.log('ERROR CONVERSION:', error);

        return res.status(500).json({
            success: false,
            message: error.message || 'Error en la conversión',
            error: error.toString ? error.toString() : error,
        });
    }
};

export const refreshRatesByBase = async (req, res, next) => {
    try {
        const baseCurrency = req.body?.baseCurrency || req.query?.baseCurrency || 'USD';
        const result = await refreshRatesByBaseInDB(baseCurrency);

        return res.status(200).json({
            success: true,
            message: 'Tasas actualizadas exitosamente desde ExchangeRate-API',
            result,
        });
    } catch (err) {
        next(err);
    }
};

export const getRatesByBase = async (req, res, next) => {
    try {
        const { baseCurrency } = req.params;
        const data = await getRatesByBaseInDB(baseCurrency);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (err) {
        next(err);
    }
};

export const getConversionHistory = async (req, res, next) => {
    try {
        const { limit } = req.query;
        const history = await getConversionHistoryInDB({
            userId: req.user?.id || null,
            role: req.user?.role || 'CLIENT',
            limit,
        });

        return res.status(200).json({
            success: true,
            total: history.length,
            history,
        });
    } catch (err) {
        next(err);
    }
};
