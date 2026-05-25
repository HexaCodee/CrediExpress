import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { normalizeUserModel } from '../../../shared/utils/user.js';
import { getBankProfileByUserId } from '../../../shared/apis/bank.js';
import { getOperationalAccount } from '../../../shared/apis/coreBanking.js';
import { convertCurrency } from '../../../shared/apis/conversion.js';

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '0.00';
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const CurrencyConversionPage = () => {
  const rawAuthUser = useAuthStore((state) => state.user);
  const authUser = useMemo(() => normalizeUserModel(rawAuthUser) || rawAuthUser, [rawAuthUser]);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('GTQ');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === selectedAccountNumber),
    [accounts, selectedAccountNumber]
  );

  const activeFromCurrency = selectedAccount?.currency || fromCurrency;
  const availableBalance = Number(selectedAccount?.balance ?? 0);

  const loadAccounts = async () => {
    if (!authUser?.id) return;

    setAccountLoading(true);
    try {
      const response = await getBankProfileByUserId(authUser.id);
      const profile = response.profile;
      const accountNumbers = Array.isArray(profile?.accountNumbers) ? profile.accountNumbers : [];

      const loadedAccounts = [];
      await Promise.all(
        accountNumbers.map(async (accountNumber) => {
          try {
            const res = await getOperationalAccount(accountNumber);
            loadedAccounts.push({
              accountNumber,
              currency: res.account?.currency || profile.preferredCurrency || 'GTQ',
              balance: Number(res.account?.balance ?? 0),
              status: res.account?.status || 'ACTIVA',
            });
          } catch {
            loadedAccounts.push({ accountNumber, currency: profile.preferredCurrency || 'GTQ', balance: 0, status: 'ACTIVA' });
          }
        })
      );

      setAccounts(loadedAccounts);
      if (!selectedAccountNumber && loadedAccounts.length > 0) {
        setSelectedAccountNumber(loadedAccounts[0].accountNumber);
      }
    } catch (err) {
      setAccounts([]);
    } finally {
      setAccountLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [authUser]);

  useEffect(() => {
    if (selectedAccount && selectedAccount.currency) {
      setFromCurrency(selectedAccount.currency);
    }
  }, [selectedAccount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    const amountValue = Number(amount);
    if (!selectedAccount) {
      setError('Selecciona una cuenta de origen para debitar.');
      return;
    }

    if (amountValue <= 0) {
      setError('Ingresa un monto mayor a cero.');
      return;
    }

    if (amountValue > availableBalance) {
      setError(
        `Saldo insuficiente en la cuenta ${selectedAccount.accountNumber}. Disponible: ${formatAmount(availableBalance)} ${selectedAccount.currency}.`
      );
      return;
    }

    setLoading(true);

    try {
      const data = await convertCurrency({
        from: activeFromCurrency,
        to: toCurrency,
        amount: amountValue,
        description: `Conversión desde cuenta ${selectedAccount.accountNumber}`,
        accountNumber: selectedAccount.accountNumber,
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
        <div className='grid gap-4 lg:grid-cols-2'>
          <label className='space-y-2 text-sm text-slate-300'>
            Cuenta de origen
            <select
              value={selectedAccountNumber}
              onChange={(e) => setSelectedAccountNumber(e.target.value)}
              disabled={accountLoading || accounts.length === 0}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
            >
              <option value=''>Selecciona una cuenta</option>
              {accounts.map((account) => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber} · {account.currency} · {formatAmount(account.balance)}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2 text-sm text-slate-300'>
            Moneda destino
            <input
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value.toUpperCase())}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
              placeholder='USD'
              maxLength={3}
            />
          </label>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <label className='space-y-2 text-sm text-slate-300'>
            Moneda origen
            <input
              value={activeFromCurrency}
              disabled={Boolean(selectedAccount)}
              onChange={(e) => setFromCurrency(e.target.value.toUpperCase())}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-70'
              placeholder='GTQ'
              maxLength={3}
            />
          </label>

          <label className='space-y-2 text-sm text-slate-300'>
            Monto a cambiar
            <input
              type='number'
              step='0.01'
              min='0.01'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
              placeholder='100.00'
            />
          </label>

          <div className='rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-slate-200'>
            <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Saldo disponible</p>
            <p className='mt-2 text-sm text-white'>
              {selectedAccount ? `${formatAmount(availableBalance)} ${selectedAccount.currency}` : 'Selecciona una cuenta'}
            </p>
            <p className='mt-3 text-xs text-slate-400'>
              El débito se hará desde la cuenta seleccionada. No se puede ingresar un monto mayor al saldo disponible.
            </p>
          </div>
        </div>

        {error && (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
            {error}
          </div>
        )}

        <button
          type='submit'
          disabled={loading || accountLoading || accounts.length === 0}
          className='inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {loading ? 'Convirtiendo...' : 'Realizar conversión'}
        </button>
      </form>

      {selectedAccount && (
        <div className='rounded-3xl bg-transparent p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>Cuenta seleccionada</h2>
          <div className='mt-4 space-y-2 text-sm text-slate-200'>
            <p><span className='font-semibold'>Número:</span> {selectedAccount.accountNumber}</p>
            <p><span className='font-semibold'>Moneda:</span> {selectedAccount.currency}</p>
            <p><span className='font-semibold'>Saldo actual:</span> {formatAmount(selectedAccount.balance)} {selectedAccount.currency}</p>
          </div>
        </div>
      )}

      {result && (
        <div className='rounded-3xl bg-transparent p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>Resultado</h2>
          <div className='mt-4 space-y-3 text-sm text-slate-200'>
            <p>
              <span className='font-semibold'>Monto original:</span> {formatAmount(result.amount)} {result.fromCurrency}
            </p>
            <p>
              <span className='font-semibold'>Tasa de cambio:</span> {result.exchangeRate}
            </p>
            <p>
              <span className='font-semibold'>Comisión:</span> {formatAmount(result.commissionAmount)} {result.toCurrency} ({result.commissionPercent}%)
            </p>
            <p>
              <span className='font-semibold'>Total convertido:</span> {formatAmount(result.convertedAmount)} {result.toCurrency}
            </p>
            <p>
              <span className='font-semibold'>Saldo estimado restante:</span>{' '}
              {formatAmount(availableBalance - Number(amount))} {activeFromCurrency}
            </p>
            <p>
              <span className='font-semibold'>Equivalente en destino:</span>{' '}
              {formatAmount(result.convertedAmount)} {result.toCurrency}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
