import { Router } from 'express';
import { check, query } from 'express-validator';
import {
    addCurrency,
    deleteCurrency,
    getCurrencies,
    getCurrencyByCode,
    getCurrencyById,
    quoteExchange,
    updateCurrency,
    updateExchangeRate,
} from './currency.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

router.get('/', getCurrencies);

router.get('/quote', [
    query('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    checkValidators,
], quoteExchange);

router.get('/code/:code', [
    check('code', 'code es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    checkValidators,
], getCurrencyByCode);

router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getCurrencyById);

router.post('/', [
    validateJWT,
    isAdminRole,
    check('code', 'code es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('name', 'name es obligatorio').not().isEmpty(),
    check('name', 'name debe tener entre 3 y 80 caracteres').isLength({ min: 3, max: 80 }),
    check('symbol', 'symbol es obligatorio').not().isEmpty(),
    check('symbol', 'symbol debe tener máximo 5 caracteres').isLength({ min: 1, max: 5 }),
    check('rateToGTQ', 'rateToGTQ debe ser mayor a 0').isFloat({ min: 0.000001 }),
    checkValidators,
], addCurrency);

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('code', 'code debe tener 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('name', 'name debe tener entre 3 y 80 caracteres').optional().isLength({ min: 3, max: 80 }),
    check('symbol', 'symbol debe tener máximo 5 caracteres').optional().isLength({ min: 1, max: 5 }),
    check('rateToGTQ', 'rateToGTQ debe ser mayor a 0').optional().isFloat({ min: 0.000001 }),
    checkValidators,
], updateCurrency);

router.patch('/code/:code/rate', [
    validateJWT,
    isAdminRole,
    check('code', 'code es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('rateToGTQ', 'rateToGTQ es obligatorio y debe ser mayor a 0').isFloat({ min: 0.000001 }),
    checkValidators,
], updateExchangeRate);

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteCurrency);

export default router;
