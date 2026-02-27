import Account from './account.model.js';

const generateAccountNumber = () => {
    const prefix = '10';
    const randomPart = Math.floor(10000000 + Math.random() * 90000000).toString();
    return `${prefix}${randomPart}`;
};

const generateUniqueAccountNumber = async () => {
    for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = generateAccountNumber();
        const exists = await Account.exists({ accountNumber: candidate });
        if (!exists) {
            return candidate;
        }
    }
    throw new Error('No fue posible generar un número de cuenta único');
};

export const getAllAccountsInDB = async () => {
    return await Account.find({ status: { $ne: 'CLOSED' } }).sort({ createdAt: -1 });
};

export const getAccountByIdInDB = async (id) => {
    return await Account.findById(id);
};

export const getAccountByNumberInDB = async (accountNumber) => {
    return await Account.findOne({ accountNumber });
};

export const getAccountsByUserIdInDB = async (userId) => {
    return await Account.find({ userId, status: { $ne: 'CLOSED' } }).sort({ createdAt: -1 });
};

export const createAccountRecord = async (accountData) => {
    const accountNumber = await generateUniqueAccountNumber();
    const account = new Account({
        ...accountData,
        accountNumber,
        status: 'ACTIVE',
    });

    await account.save();
    return account;
};

export const updateAccountInDB = async (id, accountData) => {
    return await Account.findByIdAndUpdate(id, accountData, {
        new: true,
        runValidators: true,
    });
};

export const changeAccountStatusInDB = async (id, status) => {
    return await Account.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
};

export const closeAccountInDB = async (id) => {
    const account = await Account.findById(id);

    if (!account) {
        return null;
    }

    if (account.balance > 0) {
        const error = new Error('No se puede cerrar una cuenta con saldo mayor a 0');
        error.statusCode = 409;
        error.code = 'ACCOUNT_WITH_BALANCE';
        throw error;
    }

    account.status = 'CLOSED';
    await account.save();
    return account;
};
