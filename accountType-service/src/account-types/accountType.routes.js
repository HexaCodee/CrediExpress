import { Router } from 'express';
import { check } from 'express-validator';
import {
    addAccountType,
    deleteAccountType,
    getAccountTypeById,
    getAccountTypes,
    updateAccountType
} from './accountType.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /account-types:
 *   get:
 *     summary: Lista los tipos de cuenta
 *     tags: [AccountTypes]
 *     responses:
 *       200:
 *         description: Tipos de cuenta obtenidos correctamente
 */
router.get('/', getAccountTypes);

/**
 * @swagger
 * /account-types/{id}:
 *   get:
 *     summary: Obtiene un tipo de cuenta por id
 *     tags: [AccountTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de MongoDB del tipo de cuenta
 *         required: true
 *         schema:
 *           type: string
 *           example: 680c5a1b7c8e9f001234abcd
 *     responses:
 *       200:
 *         description: Tipo de cuenta obtenido correctamente
 *       400:
 *         description: ID invalido o errores de validacion
 *       404:
 *         description: Tipo de cuenta no encontrado
 */
router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getAccountTypeById);

/**
 * @swagger
 * /account-types:
 *   post:
 *     summary: Crea un tipo de cuenta
 *     tags: [AccountTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - minimumOpeningAmount
 *               - monthlyMaintenanceFee
 *               - dailyTransferLimit
 *               - perTransferLimit
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               minimumOpeningAmount:
 *                 type: number
 *               monthlyMaintenanceFee:
 *                 type: number
 *               dailyTransferLimit:
 *                 type: number
 *               perTransferLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tipo de cuenta creado correctamente
 */
router.post('/', [
    validateJWT,
    isAdminRole,
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre debe tener entre 3 y 30 caracteres').isLength({ min: 3, max: 30 }),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe tener entre 5 y 180 caracteres').isLength({ min: 5, max: 180 }),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser numérico y >= 0').isFloat({ min: 0 }),
    check('monthlyMaintenanceFee', 'La cuota mensual debe ser numérica y >= 0').isFloat({ min: 0 }),
    check('dailyTransferLimit', 'El límite diario debe ser numérico y >= 0').isFloat({ min: 0 }),
    check('perTransferLimit', 'El límite por transferencia debe ser numérico y >= 0').isFloat({ min: 0 }),
    checkValidators,
], addAccountType);

/**
 * @swagger
 * /account-types/{id}:
 *   put:
 *     summary: Actualiza un tipo de cuenta
 *     tags: [AccountTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de MongoDB del tipo de cuenta
 *         required: true
 *         schema:
 *           type: string
 *           example: 680c5a1b7c8e9f001234abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Tipo de cuenta actualizado correctamente
 *       400:
 *         description: ID invalido o errores de validacion
 *       404:
 *         description: Tipo de cuenta no encontrado
 */
router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('name', 'El nombre debe tener entre 3 y 30 caracteres').optional().isLength({ min: 3, max: 30 }),
    check('description', 'La descripción debe tener entre 5 y 180 caracteres').optional().isLength({ min: 5, max: 180 }),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser numérico y >= 0').optional().isFloat({ min: 0 }),
    check('monthlyMaintenanceFee', 'La cuota mensual debe ser numérica y >= 0').optional().isFloat({ min: 0 }),
    check('dailyTransferLimit', 'El límite diario debe ser numérico y >= 0').optional().isFloat({ min: 0 }),
    check('perTransferLimit', 'El límite por transferencia debe ser numérico y >= 0').optional().isFloat({ min: 0 }),
    checkValidators,
], updateAccountType);

/**
 * @swagger
 * /account-types/{id}:
 *   delete:
 *     summary: Elimina un tipo de cuenta
 *     tags: [AccountTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         description: ID de MongoDB del tipo de cuenta
 *         required: true
 *         schema:
 *           type: string
 *           example: 680c5a1b7c8e9f001234abcd
 *     responses:
 *       200:
 *         description: Tipo de cuenta eliminado correctamente
 *       400:
 *         description: ID invalido o errores de validacion
 *       404:
 *         description: Tipo de cuenta no encontrado
 */
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteAccountType);

export default router;
