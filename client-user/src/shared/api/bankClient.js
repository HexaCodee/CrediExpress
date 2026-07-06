// src/shared/api/bankClient.js
//
// Cliente para bank-service (Node, puerto 3006): perfil bancario del cliente
// (lista de números de cuenta, cuenta primaria, moneda preferida).

import { ENDPOINTS } from '../constants/endpoints';
import { createHttpClient } from './httpClient';

const bankClient = createHttpClient(ENDPOINTS.BANK);

export default bankClient;

export function getBankProfile(userId) {
  return bankClient.get(`/${userId}`);
}
