import { useState } from 'react';
import { convertCurrency } from '../../../shared/apis/conversion.js';

export const CurrencyConversionPage = () => {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GTQ');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const data = await convertCurrency({
        from: fromCurrency,
        to: toCurrency,
        amount: Number(amount),
      });
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Error realizando la conversión'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className='max-w-4xl mx-auto space-y-6'>
      <header className='rounded-3xl bg-transparent p-6 text-center shadow-xl border border-slate-700'>
        <h1 className='text-2xl font-semibold text-white'>Conversión de divisas</h1>
      </header>

      <form
        onSubmit={handleSubmit}
        className='grid gap-4 rounded-3xl bg-transparent p-6 shadow-xl border border-slate-700'
      >
        <div className='grid gap-3 md:grid-cols-3'>
            <label className='space-y-2 text-sm text-slate-300'>
            Monto a cambiar
            <input
              type='number'
              step='0.01'
              min='0'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
              placeholder='100.00'
            />
          </label>
          <label className='space-y-2 text-sm text-slate-300'>
            Moneda origen
            <input
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
              placeholder='USD'
              maxLength={3}
            />
          </label>

          <label className='space-y-2 text-sm text-slate-300'>
            Moneda destino
            <input
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
              placeholder='GTQ'
              maxLength={3}
            />
          </label>

          
        </div>

        {error && (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
            {error}
          </div>
        )}

        <button
          type='submit'
          disabled={loading}
          className='inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Convirtiendo...' : 'Calcular conversión'}
        </button>
      </form>

      {result && (
        <div className='rounded-3xl bg-transparent p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>Resultado</h2>
          <div className='mt-4 space-y-3 text-sm text-slate-200'>
            <p>
              <span className='font-semibold'>Monto original:</span> {result.amount} {result.fromCurrency}
            </p>
            <p>
              <span className='font-semibold'>Tasa de cambio:</span> {result.exchangeRate}
            </p>
            <p>
              <span className='font-semibold'>Comisión:</span> {result.commissionAmount} {result.toCurrency} ({result.commissionPercent}%)
            </p>
            <p>
              <span className='font-semibold'>Total convertido:</span> {result.convertedAmount} {result.toCurrency}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
