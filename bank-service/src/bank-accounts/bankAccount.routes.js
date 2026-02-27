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

router.get('/summary/portfolio', [validateJWT, isAdminRole], getPortfolioSummary);

router.get('/', [validateJWT, isAdminRole], getBankProfiles);

router.get('/:userId', [
    validateJWT,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    checkValidators,
], getBankProfileByUserId);

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

router.patch('/:userId/primary-account', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('primaryAccountNumber', 'primaryAccountNumber es obligatorio').not().isEmpty(),
    check('primaryAccountNumber', 'primaryAccountNumber debe tener al menos 8 caracteres').isLength({ min: 8 }),
    checkValidators,
], setPrimaryAccount);

router.patch('/:userId/status', [
    validateJWT,
    isAdminRole,
    check('userId', 'El userId es obligatorio').not().isEmpty(),
    check('profileStatus', 'profileStatus inválido').isIn(['ACTIVE', 'SUSPENDED']),
    checkValidators,
], updateProfileStatus);

export default router;
