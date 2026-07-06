// src/shared/api/conversionClient.js
//
// Cliente para currency-conversion-service (Node, puerto 3009): cotización,
// conversión de divisas e historial. No mueve saldo entre cuentas (eso lo
// hace core-banking-service en una transferencia); esto es una calculadora
// de cambio con historial propio.

import { ENDPOINTS } from '../constants/endpoints';
import { createHttpClient } from './httpClient';

const conversionClient = createHttpClient(ENDPOINTS.CONVERSION);

export default conversionClient;

export function quoteConversion(from, to, amount) {
  return conversionClient.get('/quote', { params: { from, to, amount } });
}

export function convertCurrency(payload) {
  return conversionClient.post('/convert', payload);
}

export function getConversionHistory(limit = 50) {
  return conversionClient.get('/history', { params: { limit } });
}
