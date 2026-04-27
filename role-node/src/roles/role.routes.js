import { Router } from 'express';
import { getRoles, addRole, updateRole, deleteRole } from './role.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js'
import { isAdminRole } from '../../middlewares/validate-role.js'
import { checkValidators } from '../../middlewares/check-validators.js';
import { check } from 'express-validator';

const router = Router();

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Lista roles
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: Roles obtenidos correctamente
 */
router.get('/', getRoles);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crea un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [CLIENT, BANK_ADMIN, CASHIER]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rol creado correctamente
 */
router.post('/', [
    validateJWT,
    isAdminRole,
    check('name', 'El nombre del rol es obligatorio').not().isEmpty(),
    check('name', 'El rol debe ser CLIENT, BANK_ADMIN o CASHIER').isIn(['CLIENT', 'BANK_ADMIN', 'CASHIER']),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe tener entre 3 y 120 caracteres').isLength({ min: 3, max: 120 }),
    checkValidators
], addRole);

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Actualiza un rol
 *     tags: [Roles]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Rol actualizado correctamente
 */
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

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: Elimina un rol
 *     tags: [Roles]
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
 *         description: Rol eliminado correctamente
 */
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators
], deleteRole);

export default router;