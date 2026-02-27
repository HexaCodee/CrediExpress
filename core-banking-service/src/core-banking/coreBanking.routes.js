import { Router } from 'express';
import { check } from 'express-validator';
import {
    createDeposit,
    createTransfer,
    getAccountOverview,
    getHistoryByAccount,
    getOperationalAccount,
    getOperationalAccounts,
    getRecentMovementsByAccount,
    getTopAccountsByMovements,
    getTransferUsageToday,
    registerOperationalAccount,
    reverseDeposit,
    updateDepositAmount,
} from './coreBanking.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

router.get('/accounts', [validateJWT, isAdminRole], getOperationalAccounts);

router.get('/accounts/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getOperationalAccount);

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

router.post('/deposits', [
    validateJWT,
    isAdminRole,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], createDeposit);

router.patch('/deposits/:transactionId/amount', [
    validateJWT,
    isAdminRole,
    check('transactionId', 'transactionId inválido').isMongoId(),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    checkValidators,
], updateDepositAmount);

router.patch('/deposits/:transactionId/reverse', [
    validateJWT,
    isAdminRole,
    check('transactionId', 'transactionId inválido').isMongoId(),
    checkValidators,
], reverseDeposit);

router.post('/transfers', [
    validateJWT,
    check('fromAccountNumber', 'fromAccountNumber inválido').isLength({ min: 8, max: 20 }),
    check('toAccountNumber', 'toAccountNumber inválido').isLength({ min: 8, max: 20 }),
    check('amount', 'amount debe ser numérico y > 0').isFloat({ min: 0.01 }),
    check('description', 'description debe tener máximo 250 caracteres').optional().isLength({ max: 250 }),
    checkValidators,
], createTransfer);

router.get('/history/account/:accountNumber', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getHistoryByAccount);

router.get('/history/account/:accountNumber/recent', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getRecentMovementsByAccount);

router.get('/transfers/usage/:accountNumber/today', [
    validateJWT,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getTransferUsageToday);

router.get('/admin/accounts/top-movements', [
    validateJWT,
    isAdminRole,
], getTopAccountsByMovements);

router.get('/admin/accounts/:accountNumber/overview', [
    validateJWT,
    isAdminRole,
    check('accountNumber', 'No. cuenta inválido').isLength({ min: 8, max: 20 }),
    checkValidators,
], getAccountOverview);

export default router;
