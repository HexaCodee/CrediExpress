import { Router } from 'express';
import { check, query } from 'express-validator';
import {
    convertCurrency,
    getConversionHistory,
    getRatesByBase,
    quoteConversion,
    refreshRatesByBase,
} from './conversion.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

router.get('/quote', [
    query('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    checkValidators,
], quoteConversion);

router.post('/convert', [
    validateJWT,
    check('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], convertCurrency);

router.post('/rates/refresh', [
    validateJWT,
    isAdminRole,
    check('baseCurrency', 'baseCurrency debe tener 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    checkValidators,
], refreshRatesByBase);

router.get('/rates/:baseCurrency', [
    check('baseCurrency', 'baseCurrency debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    checkValidators,
], getRatesByBase);

router.get('/history', [
    validateJWT,
    query('limit', 'limit debe ser un entero entre 1 y 200').optional().isInt({ min: 1, max: 200 }),
    checkValidators,
], getConversionHistory);

export default router;
