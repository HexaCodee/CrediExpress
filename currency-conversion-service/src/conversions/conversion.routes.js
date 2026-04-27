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

/**
 * @swagger
 * /conversions/quote:
 *   get:
 *     summary: Cotiza conversion sin registrar movimiento
 *     tags: [Conversions]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: amount
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Cotizacion calculada correctamente
 */
router.get('/quote', [
    query('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    checkValidators,
], quoteConversion);

/**
 * @swagger
 * /conversions/convert:
 *   post:
 *     summary: Convierte moneda y registra historial
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [from, to, amount]
 *             properties:
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conversion realizada correctamente
 */
router.post('/convert', [
    validateJWT,
    check('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], convertCurrency);

/**
 * @swagger
 * /conversions/rates/refresh:
 *   post:
 *     summary: Refresca tasas por moneda base
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               baseCurrency:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tasas refrescadas correctamente
 */
router.post('/rates/refresh', [
    validateJWT,
    isAdminRole,
    check('baseCurrency', 'baseCurrency debe tener 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    checkValidators,
], refreshRatesByBase);

/**
 * @swagger
 * /conversions/rates/{baseCurrency}:
 *   get:
 *     summary: Obtiene tasas de conversion por base
 *     tags: [Conversions]
 *     parameters:
 *       - in: path
 *         name: baseCurrency
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tasas obtenidas correctamente
 */
router.get('/rates/:baseCurrency', [
    check('baseCurrency', 'baseCurrency debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    checkValidators,
], getRatesByBase);

/**
 * @swagger
 * /conversions/history:
 *   get:
 *     summary: Obtiene historial de conversiones
 *     tags: [Conversions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente
 */
router.get('/history', [
    validateJWT,
    query('limit', 'limit debe ser un entero entre 1 y 200').optional().isInt({ min: 1, max: 200 }),
    checkValidators,
], getConversionHistory);

export default router;
