import Product from './product.model.js';

export const getAllProductsInDB = async () => {
    return await Product.find({ status: true }).sort({ name: 1 });
};

export const getProductByIdInDB = async (id) => {
    return await Product.findById(id);
};

export const getProductByCodeInDB = async (code) => {
    return await Product.findOne({ code: code.toUpperCase() });
};

export const createProductRecord = async (productData) => {
    const normalizedData = {
        ...productData,
        code: productData.code?.toUpperCase(),
        allowedCurrencies: Array.isArray(productData.allowedCurrencies)
            ? productData.allowedCurrencies.map((item) => item.toUpperCase())
            : ['GTQ'],
    };

    const product = new Product(normalizedData);
    await product.save();
    return product;
};

export const updateProductInDB = async (id, productData) => {
    const normalizedData = {
        ...productData,
        ...(productData.code && { code: productData.code.toUpperCase() }),
        ...(Array.isArray(productData.allowedCurrencies) && {
            allowedCurrencies: productData.allowedCurrencies.map((item) => item.toUpperCase())
        }),
    };

    return await Product.findByIdAndUpdate(id, normalizedData, {
        new: true,
        runValidators: true,
    });
};

export const deleteProductInDB = async (id) => {
    return await Product.findByIdAndUpdate(id, { status: false }, { new: true });
};

export const seedProducts = async () => {
    const defaults = [
        {
            code: 'SAVINGS',
            name: 'Cuenta de Ahorro',
            description: 'Producto de ahorro para clientes con movimientos habituales.',
            category: 'ACCOUNT',
            minimumOpeningAmount: 100,
            maintenanceFee: 0,
            allowedCurrencies: ['GTQ', 'USD'],
        },
        {
            code: 'CHECKING',
            name: 'Cuenta Monetaria',
            description: 'Producto para operaciones frecuentes y disponibilidad inmediata.',
            category: 'ACCOUNT',
            minimumOpeningAmount: 200,
            maintenanceFee: 25,
            allowedCurrencies: ['GTQ', 'USD', 'EUR'],
        },
        {
            code: 'PREMIUM',
            name: 'Cuenta Premium',
            description: 'Producto para clientes con operaciones multi-divisa y beneficios preferenciales.',
            category: 'ACCOUNT',
            minimumOpeningAmount: 1000,
            maintenanceFee: 45,
            allowedCurrencies: ['GTQ', 'USD', 'EUR'],
        }
    ];

    for (const item of defaults) {
        const exists = await Product.findOne({ code: item.code });
        if (!exists) {
            await createProductRecord(item);
            console.log(`CrediExpress | Producto ${item.code} creado.`);
        }
    }
};
