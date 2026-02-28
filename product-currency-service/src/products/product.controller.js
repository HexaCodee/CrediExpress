import {
    createProductRecord,
    deleteProductInDB,
    getAllProductsInDB,
    getProductByCodeInDB,
    getProductByIdInDB,
    updateProductInDB,
} from './product.service.js';

export const getProducts = async (req, res, next) => {
    try {
        const products = await getAllProductsInDB();

        return res.status(200).json({
            success: true,
            message: 'CrediExpress | Productos recuperados exitosamente',
            total: products.length,
            products,
        });
    } catch (err) {
        next(err);
    }
};

export const getProductById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await getProductByIdInDB(id);

        if (!product || !product.status) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

export const getProductByCode = async (req, res, next) => {
    try {
        const { code } = req.params;
        const product = await getProductByCodeInDB(code);

        if (!product || !product.status) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({ success: true, product });
    } catch (err) {
        next(err);
    }
};

export const addProduct = async (req, res, next) => {
    try {
        const product = await createProductRecord(req.body);

        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Producto creado exitosamente',
            product,
        });
    } catch (err) {
        next(err);
    }
};

export const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await updateProductInDB(id, req.body);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Producto actualizado correctamente',
            product,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const product = await deleteProductInDB(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Producto desactivado (eliminación lógica) exitosamente',
        });
    } catch (err) {
        next(err);
    }
};
