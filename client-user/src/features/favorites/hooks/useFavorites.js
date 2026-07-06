// src/features/favorites/hooks/useFavorites.js
import { useCallback, useEffect, useState } from 'react';
import {
  createFavoriteAccount,
  getFavoriteAccounts,
  removeFavoriteAccount,
} from '../../../shared/api/coreBankingClient';

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await getFavoriteAccounts();
      setFavorites(data.favorites || []);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudieron cargar los favoritos');
    } finally {
      setLoading(false);
    }
  }, []);

  const addFavorite = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await createFavoriteAccount(payload);
        await loadFavorites();
        return data.favorite;
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo agregar el favorito');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadFavorites],
  );

  const removeFavorite = useCallback(
    async (favoriteId) => {
      setLoading(true);
      setError(null);

      try {
        await removeFavoriteAccount(favoriteId);
        await loadFavorites();
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo eliminar el favorito');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadFavorites],
  );

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return { favorites, loading, error, reload: loadFavorites, addFavorite, removeFavorite };
}
