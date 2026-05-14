import { Router } from 'express';
import { check } from 'express-validator';
import { registerClient } from './client.controller.js';
import { checkValidators } from '../../middlewares/check-validators.js';

const router = Router();

/**
 * @swagger
 * /clients/register:
 *   post:
 *     summary: Registra un nuevo cliente y delega la creación al servicio de autenticación
 *     tags: [Clients]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, username, phone, dpi, address, email, password, jobName, monthlyIncome]
 *             properties:
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *               phone:
 *                 type: string
 *               dpi:
 *                 type: string
 *               address:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               jobName:
 *                 type: string
 *               monthlyIncome:
 *                 type: number
 *     responses:
 *       201:
 *         description: Cliente registrado correctamente
 */
router.post('/register', [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('name', 'El nombre debe tener entre 3 y 25 caracteres').isLength({ min: 3, max: 25 }),
    check('username', 'El nickname o username es obligatorio').not().isEmpty(),
    check('username', 'El username debe tener entre 3 y 25 caracteres').isLength({ min: 3, max: 25 }),
    check('phone', 'El celular es obligatorio').not().isEmpty(),
    check('phone', 'El celular debe contener exactamente 8 dígitos').matches(/^\d{8}$/),
    check('dpi', 'El DPI es obligatorio').not().isEmpty(),
    check('dpi', 'El DPI debe contener exactamente 13 dígitos').matches(/^\d{13}$/),
    check('address', 'La dirección es obligatoria').not().isEmpty(),
    check('address', 'La dirección debe tener entre 3 y 200 caracteres').isLength({ min: 3, max: 200 }),
    check('email', 'El correo es obligatorio').not().isEmpty(),
    check('email', 'El correo no es válido').isEmail(),
    check('password', 'La contraseña es obligatoria').not().isEmpty(),
    check('password', 'La contraseña debe tener entre 8 y 128 caracteres').isLength({ min: 8, max: 128 }),
    check('jobName', 'El nombre de trabajo es obligatorio').not().isEmpty(),
    check('jobName', 'El nombre de trabajo debe tener entre 3 y 100 caracteres').isLength({ min: 3, max: 100 }),
    check('monthlyIncome', 'Los ingresos mensuales son obligatorios').not().isEmpty(),
    check('monthlyIncome', 'Los ingresos mensuales deben ser un número válido').isFloat({ min: 100 }),
    checkValidators,
], registerClient);

export default router;