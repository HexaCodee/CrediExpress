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

router.get('/', getAccountTypes);

router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getAccountTypeById);

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

router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteAccountType);

export default router;
