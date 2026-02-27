import { Router } from 'express';
import { getRoles, addRole, updateRole, deleteRole } from './role.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js'
import { isAdminRole } from '../../middlewares/validate-role.js'
import { checkValidators } from '../../middlewares/check-validators.js';
import { check } from 'express-validator';

const router = Router();

// GET
router.get('/', getRoles);

// POST:
router.post('/', [
    validateJWT,
    isAdminRole,
    check('name', 'El nombre del rol es obligatorio').not().isEmpty(),
    check('name', 'El rol debe ser CLIENT, BANK_ADMIN o CASHIER').isIn(['CLIENT', 'BANK_ADMIN', 'CASHIER']),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe tener entre 3 y 120 caracteres').isLength({ min: 3, max: 120 }),
    checkValidators
], addRole);

// UPDATE:
router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('name', 'El rol debe ser CLIENT, BANK_ADMIN o CASHIER').optional().isIn(['CLIENT', 'BANK_ADMIN', 'CASHIER']),
    check('description', 'La descripción debe tener entre 3 y 120 caracteres').optional().isLength({ min: 3, max: 120 }),
    check('name', 'Debe enviar al menos name o description').custom((value, { req }) => {
        if (!req.body.name && !req.body.description) {
            throw new Error('Debe enviar al menos name o description');
        }
        return true;
    }),
    checkValidators
], updateRole);

// DELETE:
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators
], deleteRole);

export default router;