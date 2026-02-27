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

router.get('/', [validateJWT, isAdminRole], getAccounts);

router.get('/by-number/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 10, max: 20 }),
    checkValidators,
], getAccountByNumber);

router.get('/by-user/:userId', [
    validateJWT,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    checkValidators,
], getAccountsByUserId);

router.get('/:id', [
    validateJWT,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getAccountById);

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

router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('ownerName', 'El nombre del titular debe tener entre 3 y 120 caracteres').optional().isLength({ min: 3, max: 120 }),
    check('currency', 'La moneda debe ser de 3 caracteres').optional().isLength({ min: 3, max: 3 }),
    check('isPrimary', 'isPrimary debe ser booleano').optional().isBoolean(),
    checkValidators,
], updateAccount);

router.patch('/:id/block', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], blockAccount);

router.patch('/:id/unblock', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], unblockAccount);

router.patch('/:id/close', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], closeAccount);

export default router;
