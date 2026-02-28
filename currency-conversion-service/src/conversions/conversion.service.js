import RateSnapshot from './rateSnapshot.model.js';
import ConversionHistory from './conversionHistory.model.js';

const PROVIDER_NAME = 'ExchangeRate-API';

const getEnvConfig = () => ({
    apiBaseUrl: process.env.EXCHANGE_RATE_API_BASE_URL || 'https://v6.exchangerate-api.com/v6',
    apiKey: process.env.EXCHANGE_RATE_API_KEY,
    commissionPercent: Number(process.env.EXCHANGE_COMMISSION_PERCENT || 1.5),
    cacheTtlMinutes: Number(process.env.RATES_CACHE_TTL_MINUTES || 30),
    requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 8000),
});

const normalizeCurrency = (currency) => String(currency || '').trim().toUpperCase();

const buildProviderUrl = (baseCurrency, apiBaseUrl, apiKey) => `${apiBaseUrl}/${apiKey}/latest/${baseCurrency}`;

const isConfiguredApiKey = (apiKey) => !!apiKey && apiKey !== 'REPLACE_WITH_YOUR_KEY';

const toRatesMap = (ratesObject) => {
    const normalized = {};
    for (const [key, value] of Object.entries(ratesObject || {})) {
        const code = normalizeCurrency(key);
        const numericRate = Number(value);
        if (code.length === 3 && Number.isFinite(numericRate) && numericRate > 0) {
            normalized[code] = numericRate;
        }
    }
    return normalized;
};

const fetchRatesFromProvider = async (baseCurrency) => {
    const { apiBaseUrl, apiKey, cacheTtlMinutes, requestTimeoutMs } = getEnvConfig();

    if (!isConfiguredApiKey(apiKey)) {
        const error = new Error('EXCHANGE_RATE_API_KEY no está configurada');
        error.statusCode = 500;
        throw error;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
        const response = await fetch(buildProviderUrl(baseCurrency, apiBaseUrl, apiKey), {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            const error = new Error(`Proveedor de tasas respondió con estado ${response.status}`);
            error.statusCode = 502;
            throw error;
        }

        const payload = await response.json();

        if (payload?.result !== 'success' || !payload?.conversion_rates) {
            const error = new Error(payload?.['error-type'] || 'Respuesta inválida del proveedor de tasas');
            error.statusCode = 502;
            throw error;
        }

        const rates = toRatesMap(payload.conversion_rates);
        const fetchedAt = new Date();
        const expiresAt = new Date(fetchedAt.getTime() + (cacheTtlMinutes * 60 * 1000));

        return {
            baseCurrency,
            rates,
            fetchedAt,
            expiresAt,
        };
    } catch (err) {
        if (err.name === 'AbortError') {
            const timeoutError = new Error('Tiempo de espera agotado consultando ExchangeRate-API');
            timeoutError.statusCode = 504;
            throw timeoutError;
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
};

const getValidSnapshot = async (baseCurrency) => {
    return await RateSnapshot.findOne({
        baseCurrency,
        expiresAt: { $gt: new Date() },
    });
};

const upsertSnapshot = async ({ baseCurrency, rates, fetchedAt, expiresAt }) => {
    return await RateSnapshot.findOneAndUpdate(
        { baseCurrency },
        {
            provider: PROVIDER_NAME,
            baseCurrency,
            rates,
            fetchedAt,
            expiresAt,
        },
        {
            upsert: true,
            new: true,
            runValidators: true,
        }
    );
};

const resolveRateFromSnapshot = (snapshot, toCurrency) => {
    if (snapshot.baseCurrency === toCurrency) {
        return 1;
    }

    const ratesAsObject = snapshot.rates instanceof Map
        ? Object.fromEntries(snapshot.rates)
        : snapshot.rates;

    const rate = Number(ratesAsObject?.[toCurrency]);
    if (!Number.isFinite(rate) || rate <= 0) {
        return null;
    }

    return rate;
};

const applyConversion = ({ amount, rate }) => {
    const { commissionPercent } = getEnvConfig();
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        const error = new Error('El monto debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
    }

    const normalizedCommissionPercent = Number.isFinite(commissionPercent) && commissionPercent >= 0
        ? commissionPercent
        : 0;

    const convertedAmountBeforeCommission = Number((numericAmount * rate).toFixed(2));
    const commissionAmount = Number(((convertedAmountBeforeCommission * normalizedCommissionPercent) / 100).toFixed(2));
    const convertedAmount = Number((convertedAmountBeforeCommission - commissionAmount).toFixed(2));

    return {
        amount: numericAmount,
        exchangeRate: Number(rate.toFixed(6)),
        convertedAmountBeforeCommission,
        commissionPercent: normalizedCommissionPercent,
        commissionAmount,
        convertedAmount,
    };
};

export const refreshRatesByBaseInDB = async (baseCurrencyInput = 'USD') => {
    const baseCurrency = normalizeCurrency(baseCurrencyInput);

    if (baseCurrency.length !== 3) {
        const error = new Error('La moneda base debe tener 3 caracteres');
        error.statusCode = 400;
        throw error;
    }

    const liveRates = await fetchRatesFromProvider(baseCurrency);
    const snapshot = await upsertSnapshot(liveRates);

    return {
        baseCurrency,
        provider: PROVIDER_NAME,
        fetchedAt: snapshot.fetchedAt,
        expiresAt: snapshot.expiresAt,
        ratesCount: snapshot.rates?.size || Object.keys(snapshot.rates || {}).length,
        source: 'live',
    };
};

export const getRatesByBaseInDB = async (baseCurrencyInput = 'USD') => {
    const baseCurrency = normalizeCurrency(baseCurrencyInput);

    if (baseCurrency.length !== 3) {
        const error = new Error('La moneda base debe tener 3 caracteres');
        error.statusCode = 400;
        throw error;
    }

    const cachedSnapshot = await getValidSnapshot(baseCurrency);
    if (cachedSnapshot) {
        return {
            baseCurrency,
            provider: cachedSnapshot.provider,
            fetchedAt: cachedSnapshot.fetchedAt,
            expiresAt: cachedSnapshot.expiresAt,
            rates: cachedSnapshot.rates,
            source: 'cache',
        };
    }

    const refreshed = await refreshRatesByBaseInDB(baseCurrency);
    const snapshot = await RateSnapshot.findOne({ baseCurrency });

    return {
        baseCurrency,
        provider: refreshed.provider,
        fetchedAt: refreshed.fetchedAt,
        expiresAt: refreshed.expiresAt,
        rates: snapshot?.rates || {},
        source: 'live',
    };
};

export const quoteConversionInDB = async ({ from, to, amount }) => {
    const fromCurrency = normalizeCurrency(from);
    const toCurrency = normalizeCurrency(to);

    if (fromCurrency.length !== 3 || toCurrency.length !== 3) {
        const error = new Error('Las monedas deben tener exactamente 3 caracteres');
        error.statusCode = 400;
        throw error;
    }

    const rateData = await getRatesByBaseInDB(fromCurrency);
    const snapshot = await RateSnapshot.findOne({ baseCurrency: fromCurrency });
    const rate = snapshot ? resolveRateFromSnapshot(snapshot, toCurrency) : null;

    if (!rate) {
        const error = new Error(`No existe tasa disponible para convertir de ${fromCurrency} a ${toCurrency}`);
        error.statusCode = 404;
        throw error;
    }

    const calculation = applyConversion({ amount, rate });

    return {
        fromCurrency,
        toCurrency,
        ...calculation,
        provider: PROVIDER_NAME,
        source: rateData.source,
        quotedAt: new Date().toISOString(),
        ratesFetchedAt: rateData.fetchedAt,
        ratesExpiresAt: rateData.expiresAt,
    };
};

export const convertAndPersistInDB = async ({ from, to, amount, userId, description }) => {
    const quote = await quoteConversionInDB({ from, to, amount });

    const history = await ConversionHistory.create({
        userId: userId || null,
        fromCurrency: quote.fromCurrency,
        toCurrency: quote.toCurrency,
        amount: quote.amount,
        exchangeRate: quote.exchangeRate,
        convertedAmountBeforeCommission: quote.convertedAmountBeforeCommission,
        commissionPercent: quote.commissionPercent,
        commissionAmount: quote.commissionAmount,
        convertedAmount: quote.convertedAmount,
        provider: quote.provider,
        source: quote.source,
        description: description || '',
    });

    return {
        quote,
        conversionId: history._id,
        createdAt: history.createdAt,
    };
};

export const getConversionHistoryInDB = async ({ userId, role, limit = 50 }) => {
    const size = Math.min(Math.max(Number(limit) || 50, 1), 200);
    const filters = {};

    if (role !== 'BANK_ADMIN') {
        filters.userId = userId;
    }

    return await ConversionHistory.find(filters).sort({ createdAt: -1 }).limit(size);
};
