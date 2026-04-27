import { Router } from 'express';
import { check } from 'express-validator';
import {
    addProduct,
    deleteProduct,
    getProductByCode,
    getProductById,
    getProducts,
    updateProduct,
} from './product.controller.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { isAdminRole } from '../../middlewares/validate-role.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista productos
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente
 */
router.get('/', getProducts);

/**
 * @swagger
 * /products/code/{code}:
 *   get:
 *     summary: Obtiene un producto por codigo
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 */
router.get('/code/:code', [
    check('code', 'El código del producto es obligatorio').not().isEmpty(),
    checkValidators,
], getProductByCode);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 */
router.get('/:id', [
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Crea un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, name, description]
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               minimumOpeningAmount:
 *                 type: number
 *               maintenanceFee:
 *                 type: number
 *               allowedCurrencies:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 */
router.post('/', [
    validateJWT,
    isAdminRole,
    check('code', 'El código es obligatorio').not().isEmpty(),
    check('code', 'El código debe tener entre 3 y 20 caracteres').isLength({ min: 3, max: 20 }),
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre debe tener entre 3 y 120 caracteres').isLength({ min: 3, max: 120 }),
    check('description', 'La descripción es obligatoria').not().isEmpty(),
    check('description', 'La descripción debe tener entre 5 y 220 caracteres').isLength({ min: 5, max: 220 }),
    check('category', 'La categoría es inválida').optional().isIn(['ACCOUNT', 'CARD', 'LOAN', 'INVESTMENT', 'OTHER']),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser >= 0').optional().isFloat({ min: 0 }),
    check('maintenanceFee', 'La cuota de mantenimiento debe ser >= 0').optional().isFloat({ min: 0 }),
    check('allowedCurrencies', 'allowedCurrencies debe ser un arreglo').optional().isArray({ min: 1 }),
    checkValidators,
], addProduct);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Actualiza un producto
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 */
router.put('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    check('code', 'El código debe tener entre 3 y 20 caracteres').optional().isLength({ min: 3, max: 20 }),
    check('name', 'El nombre debe tener entre 3 y 120 caracteres').optional().isLength({ min: 3, max: 120 }),
    check('description', 'La descripción debe tener entre 5 y 220 caracteres').optional().isLength({ min: 5, max: 220 }),
    check('category', 'La categoría es inválida').optional().isIn(['ACCOUNT', 'CARD', 'LOAN', 'INVESTMENT', 'OTHER']),
    check('minimumOpeningAmount', 'El monto mínimo de apertura debe ser >= 0').optional().isFloat({ min: 0 }),
    check('maintenanceFee', 'La cuota de mantenimiento debe ser >= 0').optional().isFloat({ min: 0 }),
    check('allowedCurrencies', 'allowedCurrencies debe ser un arreglo').optional().isArray({ min: 1 }),
    checkValidators,
], updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Products]
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
 *         description: Producto eliminado correctamente
 */
router.delete('/:id', [
    validateJWT,
    isAdminRole,
    check('id', 'No es un ID válido de MongoDB').isMongoId(),
    checkValidators,
], deleteProduct);

export default router;
