const isRemoteDefaultAvatar = (url) =>
  typeof url === 'string' && url.includes('avatarDefault-1749508519496.png');

export const normalizeUserModel = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  const user =
    raw.user ||
    raw.User ||
    raw.userDetails ||
    raw.UserDetails ||
    raw.data ||
    raw.Data ||
    raw;

  const rawProfilePicture = user.profilePicture || user.ProfilePicture || '';
  const profilePicture = isRemoteDefaultAvatar(rawProfilePicture) ? '' : rawProfilePicture;

  return {
    id: user.id || user.Id || user._id || user.userId || user.UserId || null,
    name: user.name || user.Name || '',
    surname: user.surname || user.Surname || '',
    username: user.username || user.Username || '',
    email: user.email || user.Email || '',
    profilePicture,
    phone: user.phone || user.Phone || '',
    address: user.address || user.Address || '',
    jobName: user.jobName || user.JobName || '',
    monthlyIncome: user.monthlyIncome || user.MonthlyIncome || '',
    role: user.role || user.Role || '',
    status: typeof user.status !== 'undefined' ? user.status : user.Status,
    isEmailVerified:
      typeof user.isEmailVerified !== 'undefined'
        ? user.isEmailVerified
        : user.IsEmailVerified,
    accountNumber: user.accountNumber || user.AccountNumber || '',
    dpi: user.dpi || user.Dpi || '',
    createdAt: user.createdAt || user.CreatedAt || '',
    updatedAt: user.updatedAt || user.UpdatedAt || '',
  };
};
