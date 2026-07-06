// src/features/accounts/hooks/useAccounts.js
import { useCallback, useEffect, useState } from 'react';
import { getBankProfile } from '../../../shared/api/bankClient';
import { getOperationalAccount } from '../../../shared/api/coreBankingClient';
import { useAuthStore } from '../../../shared/store/authStore';

export function useAccounts() {
  const userId = useAuthStore((state) => state.user?.id);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadAccounts = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileResponse = await getBankProfile(userId);
      const profile = profileResponse.data.profile;
      const accountNumbers = profile?.accountNumbers || [];

      const results = await Promise.all(
        accountNumbers.map(async (accountNumber) => {
          try {
            const { data } = await getOperationalAccount(accountNumber);
            return data.account;
          } catch {
            return null;
          }
        }),
      );

      setAccounts(
        results
          .filter(Boolean)
          .map((account) => ({
            ...account,
            isPrimary: account.accountNumber === profile.primaryAccountNumber,
          })),
      );
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar las cuentas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return { accounts, loading, error, reload: loadAccounts };
}
