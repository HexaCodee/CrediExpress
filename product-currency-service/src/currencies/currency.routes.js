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

/**
 * @swagger
 * /currencies:
 *   get:
 *     summary: Lista monedas
 *     tags: [Currencies]
 *     responses:
 *       200:
 *         description: Monedas obtenidas correctamente
 */
router.get('/', getCurrencies);

/**
 * @swagger
 * /currencies/quote:
 *   get:
 *     summary: Cotiza un cambio de moneda
 *     tags: [Currencies]
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
 *         description: Cotizacion realizada correctamente
 */
router.get('/quote', [
    query('from', 'from es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('to', 'to es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    query('amount', 'amount es obligatorio y debe ser mayor a 0').isFloat({ min: 0.01 }),
    checkValidators,
], quoteExchange);

/**
 * @swagger
 * /currencies/code/{code}:
 *   get:
 *     summary: Obtiene una moneda por codigo
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moneda obtenida correctamente
 */
router.get('/code/:code', [
    check('code', 'code es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    checkValidators,
], getCurrencyByCode);

/**
 * @swagger
 * /currencies/{id}:
 *   get:
 *     summary: Obtiene una moneda por id
 *     tags: [Currencies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moneda obtenida correctamente
 */
router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getCurrencyById);

/**
 * @swagger
 * /currencies:
 *   post:
 *     summary: Crea una moneda
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, symbol, rateToGTQ]
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               symbol:
 *                 type: string
 *               rateToGTQ:
 *                 type: number
 *     responses:
 *       201:
 *         description: Moneda creada correctamente
 */
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

/**
 * @swagger
 * /currencies/{id}:
 *   put:
 *     summary: Actualiza una moneda
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Moneda actualizada correctamente
 */
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

/**
 * @swagger
 * /currencies/code/{code}/rate:
 *   patch:
 *     summary: Actualiza solo la tasa de cambio
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rateToGTQ]
 *             properties:
 *               rateToGTQ:
 *                 type: number
 *     responses:
 *       200:
 *         description: Tasa actualizada correctamente
 */
router.patch('/code/:code/rate', [
    validateJWT,
    isAdminRole,
    check('code', 'code es obligatorio y debe tener 3 caracteres').isLength({ min: 3, max: 3 }),
    check('rateToGTQ', 'rateToGTQ es obligatorio y debe ser mayor a 0').isFloat({ min: 0.000001 }),
    checkValidators,
], updateExchangeRate);

/**
 * @swagger
 * /currencies/{id}:
 *   delete:
 *     summary: Elimina una moneda
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moneda eliminada correctamente
 */
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteCurrency);

export default router;
