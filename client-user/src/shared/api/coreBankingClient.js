// src/shared/api/coreBankingClient.js
//
// Cliente para core-banking-service (Node, puerto 3007): saldo real de cada
// cuenta, transferencias, favoritos e historial de movimientos.

import { ENDPOINTS } from '../constants/endpoints';
import { createHttpClient } from './httpClient';

const coreBankingClient = createHttpClient(ENDPOINTS.CORE_BANKING);

export default coreBankingClient;

export function getOperationalAccount(accountNumber) {
  return coreBankingClient.get(`/accounts/${accountNumber}`);
}

export function createTransfer(payload) {
  return coreBankingClient.post('/transfers', payload);
}

export function getTransferUsageToday(accountNumber) {
  return coreBankingClient.get(`/transfers/usage/${accountNumber}/today`);
}

export function getFavoriteAccounts() {
  return coreBankingClient.get('/favorites');
}

export function createFavoriteAccount(payload) {
  return coreBankingClient.post('/favorites', payload);
}

export function removeFavoriteAccount(favoriteId) {
  return coreBankingClient.delete(`/favorites/${favoriteId}`);
}

export function getAccountHistory(accountNumber, limit = 50) {
  return coreBankingClient.get(`/history/account/${accountNumber}`, { params: { limit } });
}

export function getRecentMovements(accountNumber, limit = 5) {
  return coreBankingClient.get(`/history/account/${accountNumber}/recent`, { params: { limit } });
}
