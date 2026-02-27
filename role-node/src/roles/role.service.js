import Role from './role.model.js';

export const getAllRolesInDB = async () => {
    try {
        return await Role.find({ status: true });
    } catch (err) {
        throw new Error(`Error al obtener roles de la base de datos: ${err.message}`);
    }
};

export const createRoleRecord = async (roleData) => {
    try {
        const role = new Role(roleData);
        await role.save();
        return role;
    } catch (err) {
        throw err;
    }
};

export const updateRoleInDB = async (id, roleData) => {
    try {
        return await Role.findByIdAndUpdate(id, roleData, { new: true });
    } catch (err) {
        throw err;
    }
};

export const deleteRoleInDB = async (id) => {
    try {
        // Solo desactivamos el status
        return await Role.findByIdAndUpdate(id, { status: false }, { new: true });
    } catch (err) {
        throw err;
    }
};

export const seedRoles = async () => {
    try {
        const rolesToCreate = [
            { name: 'CLIENT', description: 'Usuario final' },
            { name: 'BANK_ADMIN', description: 'Administrador' },
            { name: 'CASHIER', description: 'Cajero' }
        ];

        for (const roleData of rolesToCreate) {
            const exists = await Role.findOne({ name: roleData.name });
            if (!exists) {
                await createRoleRecord(roleData);
                console.log(`CrediExpress | Rol ${roleData.name} creado.`);
            }
        }
    } catch (error) {
        console.error("CrediExpress | Error en seed:", error.message);
    }
};