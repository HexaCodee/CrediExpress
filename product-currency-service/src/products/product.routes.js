import { Router } from 'express';
import { check } from 'express-validator';
import {
    addProduct,
    deleteProduct,
    getProductByCode,
    getProductById,
    getProducts,
    updateProduct,
} from './product.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

router.get('/', getProducts);

router.get('/code/:code', [
    check('code', 'El código del producto es obligatorio').not().isEmpty(),
    checkValidators,
], getProductByCode);

router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getProductById);

router.post('/', [
    validateJWT,
    isAdminRole,
    check('code', 'El código es obligatorio').not().isEmpty(),
    check('code', 'El código debe tener entre 3 y 20 caracteres').isLength({ min: 3, max: 20 }),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre debe tener entre 3 y 120 caracteres').isLength({ min: 3, max: 120 }),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe tener entre 5 y 220 caracteres').isLength({ min: 5, max: 220 }),
    check('category', 'La categoría es inválida').optional().isIn(['ACCOUNT', 'CARD', 'LOAN', 'INVESTMENT', 'OTHER']),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser >= 0').optional().isFloat({ min: 0 }),
    check('maintenanceFee', 'La cuota de mantenimiento debe ser >= 0').optional().isFloat({ min: 0 }),
    check('allowedCurrencies', 'allowedCurrencies debe ser un arreglo').optional().isArray({ min: 1 }),
    checkValidators,
], addProduct);

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('code', 'El código debe tener entre 3 y 20 caracteres').optional().isLength({ min: 3, max: 20 }),
    check('name', 'El nombre debe tener entre 3 y 120 caracteres').optional().isLength({ min: 3, max: 120 }),
    check('description', 'La descripción debe tener entre 5 y 220 caracteres').optional().isLength({ min: 5, max: 220 }),
    check('category', 'La categoría es inválida').optional().isIn(['ACCOUNT', 'CARD', 'LOAN', 'INVESTMENT', 'OTHER']),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser >= 0').optional().isFloat({ min: 0 }),
    check('maintenanceFee', 'La cuota de mantenimiento debe ser >= 0').optional().isFloat({ min: 0 }),
    check('allowedCurrencies', 'allowedCurrencies debe ser un arreglo').optional().isArray({ min: 1 }),
    checkValidators,
], updateProduct);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteProduct);

export default router;
