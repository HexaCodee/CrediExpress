import AccountType from './accountType.model.js';

export const getAllAccountTypesInDB = async () => {
    return await AccountType.find({ status: true }).sort({ name: 1 });
};

export const getAccountTypeByIdInDB = async (id) => {
    return await AccountType.findById(id);
};

export const createAccountTypeRecord = async (accountTypeData) => {
    const accountType = new AccountType(accountTypeData);
    await accountType.save();
    return accountType;
};

export const updateAccountTypeInDB = async (id, accountTypeData) => {
    return await AccountType.findByIdAndUpdate(id, accountTypeData, {
        new: true,
        runValidators: true,
    });
};

export const deleteAccountTypeInDB = async (id) => {
    return await AccountType.findByIdAndUpdate(id, { status: false }, { new: true });
};

export const seedAccountTypes = async () => {
    const defaults = [
        {
            name: 'SAVINGS',
            description: 'Cuenta de ahorro para clientes con movimientos habituales.',
            minimumOpeningAmount: 100,
            monthlyMaintenanceFee: 0,
            dailyTransferLimit: 10000,
            perTransferLimit: 2000,
        },
        {
            name: 'CHECKING',
            description: 'Cuenta monetaria para operaciones frecuentes y disponibilidad inmediata.',
            minimumOpeningAmount: 200,
            monthlyMaintenanceFee: 25,
            dailyTransferLimit: 15000,
            perTransferLimit: 5000,
        },
        {
            name: 'PAYROLL',
            description: 'Cuenta orientada a acreditación de salarios y pagos recurrentes.',
            minimumOpeningAmount: 0,
            monthlyMaintenanceFee: 0,
            dailyTransferLimit: 10000,
            perTransferLimit: 3000,
        }
    ];

    for (const item of defaults) {
        const exists = await AccountType.findOne({ name: item.name });
        if (!exists) {
            await createAccountTypeRecord(item);
            console.log(`CrediExpress | Tipo de cuenta ${item.name} creado.`);
        }
    }
};
