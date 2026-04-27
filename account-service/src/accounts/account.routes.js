import { Router } from 'express';
import { check } from 'express-validator';
import {
    addAccount,
    blockAccount,
    closeAccount,
    getAccountById,
    getAccountByNumber,
    getAccounts,
    getAccountsByUserId,
    unblockAccount,
    updateAccount
} from './account.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Lista todas las cuentas
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuentas obtenidas correctamente
 */
router.get('/', [validateJWT, isAdminRole], getAccounts);

/**
 * @swagger
 * /accounts/by-number/{accountNumber}:
 *   get:
 *     summary: Obtiene una cuenta por numero
 *     tags: [Accounts]
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
 *         description: Cuenta obtenida correctamente
 */
router.get('/by-number/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 10, max: 20 }),
    checkValidators,
], getAccountByNumber);

/**
 * @swagger
 * /accounts/by-user/{userId}:
 *   get:
 *     summary: Obtiene cuentas por usuario
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cuentas del usuario obtenidas correctamente
 */
router.get('/by-user/:userId', [
    validateJWT,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    checkValidators,
], getAccountsByUserId);

/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Obtiene una cuenta por id
 *     tags: [Accounts]
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
 *         description: Cuenta obtenida correctamente
 */
router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getAccountById);

/**
 * @swagger
 * /accounts:
 *   post:
 *     summary: Crea una cuenta bancaria
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, ownerName, accountType]
 *             properties:
 *               userId:
 *                 type: string
 *               ownerName:
 *                 type: string
 *               accountType:
 *                 type: string
 *               currency:
 *                 type: string
 *               balance:
 *                 type: number
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Cuenta creada correctamente
 */
router.post('/', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('ownerName', 'El nombre del titular es obligatorio').not().isEmpty(),
    check('ownerName', 'El nombre del titular debe tener entre 3 y 120 caracteres').isLength({ min: 3, max: 120 }),
    check('accountType', 'El tipo de cuenta es obligatorio').not().isEmpty(),
    check('accountType', 'El tipo de cuenta debe tener entre 3 y 30 caracteres').isLength({ min: 3, max: 30 }),
    check('currency', 'La moneda debe ser de 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('balance', 'El saldo inicial debe ser numérico y >= 0').optional().isFloat({ min: 0 }),
    check('isPrimary', 'isPrimary debe ser booleano').optional().isBoolean(),
    checkValidators,
], addAccount);

/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Actualiza una cuenta bancaria
 *     tags: [Accounts]
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
 *             properties:
 *               ownerName:
 *                 type: string
 *               currency:
 *                 type: string
 *               isPrimary:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cuenta actualizada correctamente
 */
router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('ownerName', 'El nombre del titular debe tener entre 3 y 120 caracteres').optional().isLength({ min: 3, max: 120 }),
    check('currency', 'La moneda debe ser de 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('isPrimary', 'isPrimary debe ser booleano').optional().isBoolean(),
    checkValidators,
], updateAccount);

/**
 * @swagger
 * /accounts/{id}/block:
 *   patch:
 *     summary: Bloquea una cuenta
 *     tags: [Accounts]
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
 *         description: Cuenta bloqueada correctamente
 */
router.patch('/:id/block', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], blockAccount);

/**
 * @swagger
 * /accounts/{id}/unblock:
 *   patch:
 *     summary: Desbloquea una cuenta
 *     tags: [Accounts]
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
 *         description: Cuenta desbloqueada correctamente
 */
router.patch('/:id/unblock', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], unblockAccount);

/**
 * @swagger
 * /accounts/{id}/close:
 *   patch:
 *     summary: Cierra una cuenta
 *     tags: [Accounts]
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
 *         description: Cuenta cerrada correctamente
 */
router.patch('/:id/close', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], closeAccount);

export default router;
