import Currency from './currency.model.js';

const EXCHANGE_COMMISSION_PERCENT = Number(process.env.EXCHANGE_COMMISSION_PERCENT || 1.5);

export const getAllCurrenciesInDB = async () => {
    return await Currency.find({ status: true }).sort({ code: 1 });
};

export const getCurrencyByIdInDB = async (id) => {
    return await Currency.findById(id);
};

export const getCurrencyByCodeInDB = async (code) => {
    return await Currency.findOne({ code: code.toUpperCase() });
};

export const createCurrencyRecord = async (currencyData) => {
    const normalizedData = {
        ...currencyData,
        code: currencyData.code?.toUpperCase(),
    };

    const currency = new Currency(normalizedData);
    await currency.save();
    return currency;
};

export const updateCurrencyInDB = async (id, currencyData) => {
    const normalizedData = {
        ...currencyData,
        ...(currencyData.code && { code: currencyData.code.toUpperCase() }),
    };

    return await Currency.findByIdAndUpdate(id, normalizedData, {
        new: true,
        runValidators: true,
    });
};

export const deleteCurrencyInDB = async (id) => {
    return await Currency.findByIdAndUpdate(id, { status: false }, { new: true });
};

export const updateExchangeRateInDB = async (code, rateToGTQ) => {
    return await Currency.findOneAndUpdate(
        { code: code.toUpperCase(), status: true },
        { rateToGTQ },
        { new: true, runValidators: true }
    );
};

export const quoteExchangeInDB = async ({ from, to, amount }) => {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        const error = new Error('El monto debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
    }

    const fromCurrency = await Currency.findOne({ code: fromCode, status: true });
    const toCurrency = await Currency.findOne({ code: toCode, status: true });

    if (!fromCurrency || !toCurrency) {
        const error = new Error('Divisa origen o destino no encontrada');
        error.statusCode = 404;
        throw error;
    }

    const amountInGTQ = numericAmount * fromCurrency.rateToGTQ;
    const convertedAmountBeforeCommission = amountInGTQ / toCurrency.rateToGTQ;
    const exchangeRate = fromCurrency.rateToGTQ / toCurrency.rateToGTQ;
    const commissionPercent = Number.isFinite(EXCHANGE_COMMISSION_PERCENT) && EXCHANGE_COMMISSION_PERCENT >= 0
        ? EXCHANGE_COMMISSION_PERCENT
        : 0;
    const commissionAmount = Number(((convertedAmountBeforeCommission * commissionPercent) / 100).toFixed(2));
    const convertedAmount = Number((convertedAmountBeforeCommission - commissionAmount).toFixed(2));

    return {
        from: fromCode,
        to: toCode,
        amount: numericAmount,
        exchangeRate: Number(exchangeRate.toFixed(6)),
        convertedAmountBeforeCommission: Number(convertedAmountBeforeCommission.toFixed(2)),
        commissionPercent,
        commissionAmount,
        convertedAmount,
        quotedAt: new Date().toISOString(),
    };
};

export const seedCurrencies = async () => {
    const defaults = [
        {
            code: 'GTQ',
            name: 'Quetzal guatemalteco',
            symbol: 'Q',
            rateToGTQ: 1,
            isBase: true,
        },
        {
            code: 'USD',
            name: 'Dólar estadounidense',
            symbol: '$',
            rateToGTQ: 7.8,
            isBase: false,
        },
        {
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            rateToGTQ: 8.4,
            isBase: false,
        }
    ];

    for (const item of defaults) {
        const exists = await Currency.findOne({ code: item.code });
        if (!exists) {
            await createCurrencyRecord(item);
            console.log(`CrediExpress | Divisa ${item.code} creada.`);
        }
    }
};
