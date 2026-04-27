import { Router } from 'express';
import { check } from 'express-validator';
import {
    createDeposit,
    createFavoriteAccount,
    createQuickTransferFromFavorite,
    createTransfer,
    getAccountOverview,
    getFavoriteAccounts,
    getHistoryByAccount,
    getOperationalAccount,
    getOperationalAccounts,
    getRecentMovementsByAccount,
    getTopAccountsByMovements,
    getTransferUsageToday,
    registerOperationalAccount,
    removeFavoriteAccount,
    reverseDeposit,
    updateFavoriteAccount,
    updateDepositAmount,
} from './coreBanking.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /core-banking/accounts:
 *   get:
 *     summary: Lista cuentas operacionales
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuentas operacionales obtenidas correctamente
 */
router.get('/accounts', [validateJWT, isAdminRole], getOperationalAccounts);

/**
 * @swagger
 * /core-banking/accounts/{accountNumber}:
 *   get:
 *     summary: Obtiene una cuenta operacional por numero
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuenta operacional obtenida correctamente
 */
router.get('/accounts/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getOperationalAccount);

/**
 * @swagger
 * /core-banking/accounts/register:
 *   post:
 *     summary: Registra una cuenta operacional
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountNumber, userId]
 *             properties:
 *               accountNumber:
 *                 type: string
 *               userId:
 *                 type: string
 *               currency:
 *                 type: string
 *               status:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Cuenta operacional registrada correctamente
 */
router.post('/accounts/register', [
    validateJWT,
    isAdminRole,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    check('userId', 'userId es obligatorio').not().isEmpty(),
    check('currency', 'currency debe tener 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('status', 'status inválido').optional().isIn(['ACTIVE', 'BLOCKED', 'CLOSED']),
    check('balance', 'balance debe ser >= 0').optional().isFloat({ min: 0 }),
    checkValidators,
], registerOperationalAccount);

/**
 * @swagger
 * /core-banking/deposits:
 *   post:
 *     summary: Crea un deposito
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountNumber, amount]
 *             properties:
 *               accountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Deposito creado correctamente
 */
router.post('/deposits', [
    validateJWT,
    isAdminRole,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], createDeposit);

/**
 * @swagger
 * /core-banking/deposits/{transactionId}/amount:
 *   patch:
 *     summary: Actualiza el monto de un deposito
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Monto actualizado correctamente
 */
router.patch('/deposits/:transactionId/amount', [
    validateJWT,
    isAdminRole,
    check('transactionId', 'transactionId inválido').isMongoId(),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    checkValidators,
], updateDepositAmount);

/**
 * @swagger
 * /core-banking/deposits/{transactionId}/reverse:
 *   patch:
 *     summary: Revierte un deposito
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deposito revertido correctamente
 */
router.patch('/deposits/:transactionId/reverse', [
    validateJWT,
    isAdminRole,
    check('transactionId', 'transactionId inválido').isMongoId(),
    checkValidators,
], reverseDeposit);

/**
 * @swagger
 * /core-banking/transfers:
 *   post:
 *     summary: Realiza una transferencia
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromAccountNumber, toAccountNumber, amount]
 *             properties:
 *               fromAccountNumber:
 *                 type: string
 *               toAccountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferencia creada correctamente
 */
router.post('/transfers', [
    validateJWT,
    check('fromAccountNumber', 'fromAccountNumber inválido').isLength({ min: 8, max: 20 }),
    check('toAccountNumber', 'toAccountNumber inválido').isLength({ min: 8, max: 20 }),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], createTransfer);

/**
 * @swagger
 * /core-banking/transfers/favorites/{favoriteId}:
 *   post:
 *     summary: Realiza transferencia rapida usando favorito
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fromAccountNumber, amount]
 *             properties:
 *               fromAccountNumber:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transferencia rapida creada correctamente
 */
router.post('/transfers/favorites/:favoriteId', [
    validateJWT,
    check('favoriteId', 'favoriteId inválido').isMongoId(),
    check('fromAccountNumber', 'fromAccountNumber inválido').isLength({ min: 8, max: 20 }),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], createQuickTransferFromFavorite);

/**
 * @swagger
 * /core-banking/favorites:
 *   get:
 *     summary: Lista cuentas favoritas del usuario
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favoritos obtenidos correctamente
 */
router.get('/favorites', [
    validateJWT,
], getFavoriteAccounts);

/**
 * @swagger
 * /core-banking/favorites:
 *   post:
 *     summary: Crea una cuenta favorita
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountNumber, accountType, alias]
 *             properties:
 *               accountNumber:
 *                 type: string
 *               accountType:
 *                 type: string
 *               alias:
 *                 type: string
 *     responses:
 *       201:
 *         description: Favorito creado correctamente
 */
router.post('/favorites', [
    validateJWT,
    check('accountNumber', 'accountNumber inválido').isLength({ min: 8, max: 20 }),
    check('accountType', 'accountType es obligatorio').not().isEmpty().isLength({ min: 2, max: 40 }),
    check('alias', 'alias es obligatorio').not().isEmpty().isLength({ min: 2, max: 60 }),
    checkValidators,
], createFavoriteAccount);

/**
 * @swagger
 * /core-banking/favorites/{favoriteId}:
 *   patch:
 *     summary: Actualiza una cuenta favorita
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accountType:
 *                 type: string
 *               alias:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favorito actualizado correctamente
 */
router.patch('/favorites/:favoriteId', [
    validateJWT,
    check('favoriteId', 'favoriteId inválido').isMongoId(),
    check('accountType', 'accountType inválido').optional().isLength({ min: 2, max: 40 }),
    check('alias', 'alias inválido').optional().isLength({ min: 2, max: 60 }),
    checkValidators,
], updateFavoriteAccount);

/**
 * @swagger
 * /core-banking/favorites/{favoriteId}:
 *   delete:
 *     summary: Elimina una cuenta favorita
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorito eliminado correctamente
 */
router.delete('/favorites/:favoriteId', [
    validateJWT,
    check('favoriteId', 'favoriteId inválido').isMongoId(),
    checkValidators,
], removeFavoriteAccount);

/**
 * @swagger
 * /core-banking/history/account/{accountNumber}:
 *   get:
 *     summary: Obtiene historial por cuenta
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial obtenido correctamente
 */
router.get('/history/account/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getHistoryByAccount);

/**
 * @swagger
 * /core-banking/history/account/{accountNumber}/recent:
 *   get:
 *     summary: Obtiene movimientos recientes por cuenta
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Movimientos recientes obtenidos correctamente
 */
router.get('/history/account/:accountNumber/recent', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getRecentMovementsByAccount);

/**
 * @swagger
 * /core-banking/transfers/usage/{accountNumber}/today:
 *   get:
 *     summary: Obtiene uso diario de transferencias
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Uso diario obtenido correctamente
 */
router.get('/transfers/usage/:accountNumber/today', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getTransferUsageToday);

/**
 * @swagger
 * /core-banking/admin/accounts/top-movements:
 *   get:
 *     summary: Obtiene top de cuentas por movimientos
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top de cuentas obtenido correctamente
 */
router.get('/admin/accounts/top-movements', [
    validateJWT,
    isAdminRole,
], getTopAccountsByMovements);

/**
 * @swagger
 * /core-banking/admin/accounts/{accountNumber}/overview:
 *   get:
 *     summary: Obtiene vista general de una cuenta
 *     tags: [CoreBanking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vista general obtenida correctamente
 */
router.get('/admin/accounts/:accountNumber/overview', [
    validateJWT,
    isAdminRole,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getAccountOverview);

export default router;
