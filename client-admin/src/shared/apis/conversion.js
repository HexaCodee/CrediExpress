import { axiosConversion } from './api.js';

export const convertCurrency = async ({ from, to, amount, description }) => {
  const payload = { from, to, amount };
  if (description) payload.description = description;
  const { data } = await axiosConversion.post('/conversions/convert', payload);
  const result = data.result || {};

  return {
    ...result.quote,
    conversionId: result.conversionId,
    createdAt: result.createdAt,
  };
};

export const quoteConversion = async ({ from, to, amount }) => {
  const params = new URLSearchParams({ from, to, amount: String(amount) });
  const { data } = await axiosConversion.get(`/conversions/quote?${params.toString()}`);
  return data.quote;
};

export const getConversionRates = async (baseCurrency) => {
  const { data } = await axiosConversion.get(`/conversions/rates/${baseCurrency}`);
  return data;
};
