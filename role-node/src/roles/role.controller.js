import { createRoleRecord, getAllRolesInDB } from './role.service.js';

export const getRoles = async (req, res, next) => {
    try {
        const roles = await getAllRolesInDB();
        
        res.status(200).json({
            success: true,
            message: 'CrediExpress | Roles recuperados exitosamente',
            total: roles.length,
            roles
        });
    } catch (err) {
        next(err);
    }
};

export const addRole = async (req, res, next) => {
    try {
        const data = req.body;
        const role = await createRoleRecord(data);

        res.status(201).json({
            success: true,
            message: 'CrediExpress | Rol creado exitosamente',
            role
        });
    } catch (err) {
        next(err);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const role = await updateRoleInDB(id, data);

        res.status(200).json({
            success: true,
            message: 'Rol actualizado correctamente',
            role
        });
    } catch (err) {
        next(err);
    }
};

export const deleteRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteRoleInDB(id);

        res.status(200).json({
            success: true,
            message: 'Rol desactivado (Eliminación lógica) exitosamente'
        });
    } catch (err) {
        next(err);
    }
};