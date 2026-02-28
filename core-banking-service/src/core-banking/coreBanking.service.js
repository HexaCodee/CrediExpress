import mongoose from 'mongoose';
import CoreAccount from './coreAccount.model.js';
import Transaction from './transaction.model.js';

const MAX_TRANSFER_PER_TX = 2000;
const MAX_TRANSFER_DAILY = 10000;
const DEPOSIT_REVERSAL_WINDOW_MINUTES = 1;
const CONVERSION_SERVICE_URL = process.env.CONVERSION_SERVICE_URL || 'http://localhost:3009/crediExpress/v1';
const CONVERSION_TIMEOUT_MS = Number(process.env.CONVERSION_TIMEOUT_MS || 8000);

const buildReference = (prefix = 'TX') => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

const startOfDay = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
};

const quoteConversion = async ({ fromCurrency, toCurrency, amount }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONVERSION_TIMEOUT_MS);

    try {
        const params = new URLSearchParams({
            from: fromCurrency,
            to: toCurrency,
            amount: String(amount),
        });

        const response = await fetch(`${CONVERSION_SERVICE_URL}/conversions/quote?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            signal: controller.signal,
        });

        const payload = await response.json();

        if (!response.ok || !payload?.success || !payload?.quote) {
            const error = new Error(payload?.message || 'No fue posible obtener la tasa de conversión');
            error.statusCode = response.status || 502;
            throw error;
        }

        return payload.quote;
    } catch (err) {
        if (err.name === 'AbortError') {
            const timeoutError = new Error('Tiempo de espera agotado al consultar el servicio de conversión de divisas');
            timeoutError.statusCode = 504;
            throw timeoutError;
        }

        if (!err.statusCode) {
            err.statusCode = 502;
        }

        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
};

export const registerOperationalAccountInDB = async (data) => {
    const account = new CoreAccount({
        accountNumber: data.accountNumber,
        userId: data.userId,
        currency: data.currency || 'GTQ',
        status: data.status || 'ACTIVE',
        balance: data.balance || 0,
    });

    await account.save();
    return account;
};

export const getOperationalAccountInDB = async (accountNumber) => {
    return await CoreAccount.findOne({ accountNumber });
};

export const getAllOperationalAccountsInDB = async () => {
    return await CoreAccount.find().sort({ createdAt: -1 });
};

export const applyDepositInDB = async ({ accountNumber, amount, description, createdByUserId }) => {
    const account = await CoreAccount.findOne({ accountNumber });
    if (!account) {
        const error = new Error('Cuenta no encontrada');
        error.statusCode = 404;
        throw error;
    }

    if (account.status !== 'ACTIVE') {
        const error = new Error('La cuenta no está activa para depósitos');
        error.statusCode = 409;
        throw error;
    }

    account.balance += amount;
    await account.save();

    const tx = await Transaction.create({
        referenceId: buildReference('DEP'),
        type: 'DEPOSIT',
        status: 'APPLIED',
        accountNumber,
        amount,
        currency: account.currency,
        description: description || 'Depósito aplicado',
        createdByUserId: createdByUserId || null,
        reversibleUntil: new Date(Date.now() + DEPOSIT_REVERSAL_WINDOW_MINUTES * 60 * 1000),
    });

    return { account, transaction: tx };
};

export const adjustDepositAmountInDB = async ({ transactionId, newAmount }) => {
    const tx = await Transaction.findById(transactionId);
    if (!tx || tx.type !== 'DEPOSIT') {
        const error = new Error('Depósito no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (tx.status !== 'APPLIED') {
        const error = new Error('Solo se puede ajustar depósitos en estado APPLIED');
        error.statusCode = 409;
        throw error;
    }

    const account = await CoreAccount.findOne({ accountNumber: tx.accountNumber });
    if (!account) {
        const error = new Error('Cuenta asociada al depósito no encontrada');
        error.statusCode = 404;
        throw error;
    }

    const delta = newAmount - tx.amount;
    if (delta < 0 && account.balance < Math.abs(delta)) {
        const error = new Error('No hay saldo suficiente para ajustar el depósito a un monto menor');
        error.statusCode = 409;
        throw error;
    }

    account.balance += delta;
    tx.amount = newAmount;

    await account.save();
    await tx.save();

    return { account, transaction: tx };
};

export const revertDepositInDB = async (transactionId) => {
    const tx = await Transaction.findById(transactionId);
    if (!tx || tx.type !== 'DEPOSIT') {
        const error = new Error('Depósito no encontrado');
        error.statusCode = 404;
        throw error;
    }

    if (tx.status === 'REVERSED') {
        const error = new Error('El depósito ya fue revertido');
        error.statusCode = 409;
        throw error;
    }

    if (!tx.reversibleUntil || tx.reversibleUntil < new Date()) {
        const error = new Error('El depósito ya no está en ventana de reversión');
        error.statusCode = 409;
        throw error;
    }

    const account = await CoreAccount.findOne({ accountNumber: tx.accountNumber });
    if (!account) {
        const error = new Error('Cuenta asociada al depósito no encontrada');
        error.statusCode = 404;
        throw error;
    }

    if (account.balance < tx.amount) {
        const error = new Error('No hay saldo suficiente para revertir el depósito');
        error.statusCode = 409;
        throw error;
    }

    account.balance -= tx.amount;
    tx.status = 'REVERSED';

    await account.save();
    await tx.save();

    return { account, transaction: tx };
};

export const transferInDB = async ({ fromAccountNumber, toAccountNumber, amount, description, createdByUserId }) => {
    if (fromAccountNumber === toAccountNumber) {
        const error = new Error('No se puede transferir a la misma cuenta');
        error.statusCode = 400;
        throw error;
    }

    if (amount > MAX_TRANSFER_PER_TX) {
        const error = new Error(`El monto máximo por transferencia es Q${MAX_TRANSFER_PER_TX}`);
        error.statusCode = 409;
        throw error;
    }

    const fromAccount = await CoreAccount.findOne({ accountNumber: fromAccountNumber });
    const toAccount = await CoreAccount.findOne({ accountNumber: toAccountNumber });

    if (!fromAccount || !toAccount) {
        const error = new Error('Cuenta origen o destino no encontrada');
        error.statusCode = 404;
        throw error;
    }

    if (fromAccount.status !== 'ACTIVE' || toAccount.status !== 'ACTIVE') {
        const error = new Error('Ambas cuentas deben estar activas para transferir');
        error.statusCode = 409;
        throw error;
    }

    if (fromAccount.balance < amount) {
        const error = new Error('Fondos insuficientes');
        error.statusCode = 409;
        throw error;
    }

    const todayStart = startOfDay();
    const dailyTransferOut = await Transaction.aggregate([
        {
            $match: {
                accountNumber: fromAccountNumber,
                type: 'TRANSFER_OUT',
                status: 'APPLIED',
                createdAt: { $gte: todayStart }
            }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const usedToday = dailyTransferOut[0]?.total || 0;
    if (usedToday + amount > MAX_TRANSFER_DAILY) {
        const error = new Error(`Límite diario excedido. Máximo Q${MAX_TRANSFER_DAILY} por día`);
        error.statusCode = 409;
        throw error;
    }

    let creditAmount = amount;
    let conversionDetails = null;

    if (fromAccount.currency !== toAccount.currency) {
        conversionDetails = await quoteConversion({
            fromCurrency: fromAccount.currency,
            toCurrency: toAccount.currency,
            amount,
        });

        creditAmount = Number(conversionDetails.convertedAmount);

        if (!Number.isFinite(creditAmount) || creditAmount <= 0) {
            const error = new Error('La conversión de divisas devolvió un monto inválido');
            error.statusCode = 502;
            throw error;
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        fromAccount.balance -= amount;
        toAccount.balance += creditAmount;

        await fromAccount.save({ session });
        await toAccount.save({ session });

        const referenceId = buildReference('TRX');

        const [debitTx] = await Transaction.create([
            {
                referenceId,
                type: 'TRANSFER_OUT',
                status: 'APPLIED',
                accountNumber: fromAccountNumber,
                counterpartyAccountNumber: toAccountNumber,
                amount,
                currency: fromAccount.currency,
                description: conversionDetails
                    ? `${description || 'Transferencia enviada'} | Conversión ${fromAccount.currency}->${toAccount.currency} tasa ${conversionDetails.exchangeRate} comisión ${conversionDetails.commissionPercent}%`
                    : (description || 'Transferencia enviada'),
                createdByUserId: createdByUserId || null,
            }
        ], { session });

        const [creditTx] = await Transaction.create([
            {
                referenceId,
                type: 'TRANSFER_IN',
                status: 'APPLIED',
                accountNumber: toAccountNumber,
                counterpartyAccountNumber: fromAccountNumber,
                amount: creditAmount,
                currency: toAccount.currency,
                description: conversionDetails
                    ? `${description || 'Transferencia recibida'} | Neto acreditado tras conversión y comisión`
                    : (description || 'Transferencia recibida'),
                createdByUserId: createdByUserId || null,
            }
        ], { session });

        await session.commitTransaction();
        session.endSession();

        return {
            referenceId,
            fromAccount,
            toAccount,
            conversion: conversionDetails,
            debitTransaction: debitTx,
            creditTransaction: creditTx,
        };
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        throw err;
    }
};

export const getHistoryByAccountInDB = async (accountNumber, limit = 50) => {
    const size = Math.min(Math.max(Number(limit) || 50, 1), 200);
    return await Transaction.find({ accountNumber }).sort({ createdAt: -1 }).limit(size);
};

export const getRecentMovementsByAccountInDB = async (accountNumber, limit = 5) => {
    const size = Math.min(Math.max(Number(limit) || 5, 1), 20);
    return await Transaction.find({ accountNumber, status: 'APPLIED' }).sort({ createdAt: -1 }).limit(size);
};

export const getTransferUsageTodayInDB = async (accountNumber) => {
    const todayStart = startOfDay();
    const dailyTransferOut = await Transaction.aggregate([
        {
            $match: {
                accountNumber,
                type: 'TRANSFER_OUT',
                status: 'APPLIED',
                createdAt: { $gte: todayStart }
            }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const used = dailyTransferOut[0]?.total || 0;
    return {
        accountNumber,
        usedToday: used,
        maxDaily: MAX_TRANSFER_DAILY,
        remainingToday: Math.max(0, MAX_TRANSFER_DAILY - used)
    };
};

export const getTopAccountsByMovementsInDB = async ({ order = 'desc', limit = 10 }) => {
    const normalizedOrder = (order || 'desc').toLowerCase() === 'asc' ? 1 : -1;
    const size = Math.min(Math.max(Number(limit) || 10, 1), 100);

    const rows = await Transaction.aggregate([
        { $match: { status: 'APPLIED' } },
        {
            $group: {
                _id: '$accountNumber',
                movementCount: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                lastMovementAt: { $max: '$createdAt' }
            }
        },
        { $sort: { movementCount: normalizedOrder, totalAmount: normalizedOrder } },
        { $limit: size },
        {
            $project: {
                _id: 0,
                accountNumber: '$_id',
                movementCount: 1,
                totalAmount: 1,
                lastMovementAt: 1
            }
        }
    ]);

    return rows;
};

export const getAccountOverviewInDB = async (accountNumber) => {
    const account = await CoreAccount.findOne({ accountNumber });
    if (!account) {
        const error = new Error('Cuenta operativa no encontrada');
        error.statusCode = 404;
        throw error;
    }

    const recentMovements = await getRecentMovementsByAccountInDB(accountNumber, 5);

    return {
        accountNumber: account.accountNumber,
        userId: account.userId,
        balance: account.balance,
        currency: account.currency,
        status: account.status,
        recentMovements,
    };
};
