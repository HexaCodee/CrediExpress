// src/features/conversion/hooks/useConversion.js
import { useCallback, useEffect, useState } from 'react';
import { convertCurrency, getConversionHistory, quoteConversion } from '../../../shared/api/conversionClient';

export function useConversion() {
  const [history, setHistory] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getConversionHistory();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchQuote = useCallback(async (from, to, amount) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await quoteConversion(from, to, amount);
      setQuote(data.quote);
      return data.quote;
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo obtener la cotización');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerConversion = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await convertCurrency(payload);
        await loadHistory();
        return data.result;
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo registrar la conversión');
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

  return { history, quote, loading, error, fetchQuote, registerConversion, reload: loadHistory };
}
