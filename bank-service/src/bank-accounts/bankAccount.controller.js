import {
    createProfileInDB,
    getAllProfilesInDB,
    getPortfolioSummaryInDB,
    getProfileByUserIdInDB,
    setPrimaryAccountInDB,
    updateProfileInDB,
    updateProfileStatusInDB
} from './bankAccount.service.js';

export const createBankProfile = async (req, res, next) => {
    try {
        const profile = await createProfileInDB(req.body);
        return res.status(201).json({
            success: true,
            message: 'CrediExpress | Perfil bancario creado exitosamente',
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const getBankProfiles = async (req, res, next) => {
    try {
        const profiles = await getAllProfilesInDB();
        return res.status(200).json({
            success: true,
            total: profiles.length,
            profiles,
        });
    } catch (err) {
        next(err);
    }
};

export const getBankProfileByUserId = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const profile = await getProfileByUserIdInDB(userId);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Perfil bancario no encontrado' });
        }

        return res.status(200).json({ success: true, profile });
    } catch (err) {
        next(err);
    }
};

export const updateBankProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const profile = await updateProfileInDB(userId, req.body);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Perfil bancario no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: 'Perfil bancario actualizado correctamente',
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const setPrimaryAccount = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { primaryAccountNumber } = req.body;
        const profile = await setPrimaryAccountInDB(userId, primaryAccountNumber);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Perfil bancario no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: 'Cuenta principal actualizada correctamente',
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const updateProfileStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { profileStatus } = req.body;
        const profile = await updateProfileStatusInDB(userId, profileStatus);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Perfil bancario no encontrado' });
        }

        return res.status(200).json({
            success: true,
            message: 'Estado del perfil bancario actualizado correctamente',
            profile,
        });
    } catch (err) {
        next(err);
    }
};

export const getPortfolioSummary = async (req, res, next) => {
    try {
        const summary = await getPortfolioSummaryInDB();
        return res.status(200).json({ success: true, summary });
    } catch (err) {
        next(err);
    }
};
