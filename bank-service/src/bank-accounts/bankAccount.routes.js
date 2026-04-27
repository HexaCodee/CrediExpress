import { Router } from 'express';
import { check } from 'express-validator';
import {
    createBankProfile,
    getBankProfileByUserId,
    getBankProfiles,
    getPortfolioSummary,
    setPrimaryAccount,
    updateBankProfile,
    updateProfileStatus
} from './bankAccount.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /bank/summary/portfolio:
 *   get:
 *     summary: Obtiene resumen de portafolio
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Resumen obtenido correctamente
 */
router.get('/summary/portfolio', [validateJWT, isAdminRole], getPortfolioSummary);

/**
 * @swagger
 * /bank:
 *   get:
 *     summary: Lista perfiles bancarios
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfiles obtenidos correctamente
 */
router.get('/', [validateJWT, isAdminRole], getBankProfiles);

/**
 * @swagger
 * /bank/{userId}:
 *   get:
 *     summary: Obtiene perfil bancario por userId
 *     tags: [BankProfiles]
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
 *         description: Perfil obtenido correctamente
 */
router.get('/:userId', [
    validateJWT,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    checkValidators,
], getBankProfileByUserId);

/**
 * @swagger
 * /bank:
 *   post:
 *     summary: Crea un perfil bancario
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, accountNumbers]
 *             properties:
 *               userId:
 *                 type: string
 *               accountNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *               primaryAccountNumber:
 *                 type: string
 *               preferredCurrency:
 *                 type: string
 *               profileStatus:
 *                 type: string
 *               riskLevel:
 *                 type: string
 *     responses:
 *       201:
 *         description: Perfil creado correctamente
 */
router.post('/', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('accountNumbers', 'accountNumbers debe ser un arreglo').isArray({ min: 1 }),
    check('accountNumbers.*', 'Cada número de cuenta debe ser string de al menos 8 caracteres').isString().isLength({ min: 8 }),
    check('primaryAccountNumber', 'primaryAccountNumber debe ser de al menos 8 caracteres').optional().isString().isLength({ min: 8 }),
    check('preferredCurrency', 'La moneda debe ser de 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('profileStatus', 'profileStatus inválido').optional().isIn(['ACTIVE', 'SUSPENDED']),
    check('riskLevel', 'riskLevel inválido').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    checkValidators,
], createBankProfile);

/**
 * @swagger
 * /bank/{userId}:
 *   put:
 *     summary: Actualiza un perfil bancario
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *         description: Perfil actualizado correctamente
 */
router.put('/:userId', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('accountNumbers', 'accountNumbers debe ser un arreglo').optional().isArray(),
    check('preferredCurrency', 'La moneda debe ser de 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('profileStatus', 'profileStatus inválido').optional().isIn(['ACTIVE', 'SUSPENDED']),
    check('riskLevel', 'riskLevel inválido').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
    checkValidators,
], updateBankProfile);

/**
 * @swagger
 * /bank/{userId}/primary-account:
 *   patch:
 *     summary: Define cuenta primaria
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [primaryAccountNumber]
 *             properties:
 *               primaryAccountNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cuenta primaria actualizada correctamente
 */
router.patch('/:userId/primary-account', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('primaryAccountNumber', 'primaryAccountNumber es obligatorio').not().isEmpty(),
    check('primaryAccountNumber', 'primaryAccountNumber debe tener al menos 8 caracteres').isLength({ min: 8 }),
    checkValidators,
], setPrimaryAccount);

/**
 * @swagger
 * /bank/{userId}/status:
 *   patch:
 *     summary: Actualiza estado del perfil
 *     tags: [BankProfiles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [profileStatus]
 *             properties:
 *               profileStatus:
 *                 type: string
 *                 enum: [ACTIVE, SUSPENDED]
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 */
router.patch('/:userId/status', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('profileStatus', 'profileStatus inválido').isIn(['ACTIVE', 'SUSPENDED']),
    checkValidators,
], updateProfileStatus);

export default router;
