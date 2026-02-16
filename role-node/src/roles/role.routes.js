import { Router } from 'express';
import { getRoles, addRole, updateRole, deleteRole } from './role.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js'
import { checkValidators } from '../../middlewares/check-validators.js';
import { check } from 'express-validator';

const router = Router();

// GET
router.get('/', getRoles);

// POST:
router.post('/', [
    validateJWT,
    check('name', 'El nombre del rol es obligatorio').not().isEmpty(),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    checkValidators
], addRole);

// UPDATE:
router.put('/:id', [
    validateJWT,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators
], updateRole);

// DELETE:
router.delete('/:id', [
    validateJWT,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators
], deleteRole);

export default router;