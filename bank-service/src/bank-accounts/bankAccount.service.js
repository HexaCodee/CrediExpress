import BankAccountProfile from './bankAccount.model.js';

export const createProfileInDB = async (data) => {
    const payload = {
        ...data,
        accountNumbers: [...new Set(data.accountNumbers || [])],
    };

    if (payload.primaryAccountNumber && !payload.accountNumbers.includes(payload.primaryAccountNumber)) {
        const error = new Error('La cuenta principal debe existir dentro de accountNumbers');
        error.statusCode = 400;
        throw error;
    }

    const profile = new BankAccountProfile(payload);
    await profile.save();
    return profile;
};

export const getAllProfilesInDB = async () => {
    return await BankAccountProfile.find().sort({ createdAt: -1 });
};

export const getProfileByUserIdInDB = async (userId) => {
    return await BankAccountProfile.findOne({ userId });
};

export const updateProfileInDB = async (userId, data) => {
    if (data.accountNumbers) {
        data.accountNumbers = [...new Set(data.accountNumbers)];
    }

    return await BankAccountProfile.findOneAndUpdate(
        { userId },
        data,
        { new: true, runValidators: true }
    );
};

export const setPrimaryAccountInDB = async (userId, primaryAccountNumber) => {
    const profile = await getProfileByUserIdInDB(userId);
    if (!profile) {
        return null;
    }

    if (!profile.accountNumbers.includes(primaryAccountNumber)) {
        const error = new Error('La cuenta principal debe pertenecer al portafolio del cliente');
        error.statusCode = 400;
        throw error;
    }

    profile.primaryAccountNumber = primaryAccountNumber;
    await profile.save();
    return profile;
};

export const updateProfileStatusInDB = async (userId, profileStatus) => {
    return await BankAccountProfile.findOneAndUpdate(
        { userId },
        { profileStatus },
        { new: true, runValidators: true }
    );
};

export const getPortfolioSummaryInDB = async () => {
    const profiles = await BankAccountProfile.find({}, {
        userId: 1,
        accountNumbers: 1,
        profileStatus: 1,
        riskLevel: 1,
        _id: 0,
    });

    const totalProfiles = profiles.length;
    const activeProfiles = profiles.filter(p => p.profileStatus === 'ACTIVE').length;
    const suspendedProfiles = profiles.filter(p => p.profileStatus === 'SUSPENDED').length;
    const totalLinkedAccounts = profiles.reduce((sum, p) => sum + p.accountNumbers.length, 0);

    const riskDistribution = profiles.reduce((acc, profile) => {
        acc[profile.riskLevel] = (acc[profile.riskLevel] || 0) + 1;
        return acc;
    }, {});

    return {
        totalProfiles,
        activeProfiles,
        suspendedProfiles,
        totalLinkedAccounts,
        averageAccountsPerProfile: totalProfiles ? Number((totalLinkedAccounts / totalProfiles).toFixed(2)) : 0,
        riskDistribution,
    };
};
