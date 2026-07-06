// src/features/transfers/hooks/useTransfers.js
import { useCallback, useEffect, useState } from 'react';
import { getBankProfile } from '../../../shared/api/bankClient';
import { createTransfer as createTransferRequest, getAccountHistory } from '../../../shared/api/coreBankingClient';
import { useAuthStore } from '../../../shared/store/authStore';

export function useTransfers() {
  const userId = useAuthStore((state) => state.user?.id);
  const [accountNumber, setAccountNumber] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profileResponse = await getBankProfile(userId);
      const profile = profileResponse.data.profile;
      const primaryAccountNumber = profile?.primaryAccountNumber || profile?.accountNumbers?.[0] || null;

      setAccountNumber(primaryAccountNumber);

      if (!primaryAccountNumber) {
        setHistory([]);
        return;
      }

      const { data } = await getAccountHistory(primaryAccountNumber);
      setHistory(data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el historial de transferencias');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createTransfer = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await createTransferRequest(payload);
        await loadHistory();
        return data.result;
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo completar la transferencia');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadHistory],
  );

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { accountNumber, history, loading, error, reload: loadHistory, createTransfer };
}
