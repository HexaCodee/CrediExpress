import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../../auth/store/authStore.js';
import { normalizeUserModel } from '../../../shared/utils/user.js';
import { getBankProfileByUserId } from '../../../shared/apis/bank.js';
import { getOperationalAccount } from '../../../shared/apis/coreBanking.js';
import { createTransfer } from '../../../shared/apis/coreBanking.js';

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '0.00';
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatMoney = (value, currency = 'GTQ') => {
  const amount = formatAmount(value);
  const normalizedCurrency = currency?.toString().toUpperCase() || 'GTQ';
  return `${normalizedCurrency} ${amount}`;
};

const parseConvertedAmount = (data) => {
  const raw =
    data?.convertedAmount ??
    data?.converted_amount ??
    data?.converted ??
    data?.outputAmount ??
    data?.output_amount ??
    data?.quote?.convertedAmount ??
    data?.quote?.converted_amount ??
    0;

  return Number(raw ?? 0);
};

export const CurrencyConversionPage = () => {
  const rawAuthUser = useAuthStore((state) => state.user);
  const authUser = useMemo(() => normalizeUserModel(rawAuthUser) || rawAuthUser, [rawAuthUser]);

  const [accounts, setAccounts] = useState([]);
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [destinationAccountNumber, setDestinationAccountNumber] = useState('');
  const [amount, setAmount] = useState('100');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const markBankProfileUpdated = useAuthStore((state) => state.markBankProfileUpdated);

  const sourceAccounts = useMemo(() => {
    const positive = accounts.filter((account) => Number(account.balance) > 0);
    return positive.length > 0 ? positive : accounts;
  }, [accounts]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === selectedAccountNumber),
    [accounts, selectedAccountNumber]
  );

  const destinationAccount = useMemo(
    () => accounts.find((account) => account.accountNumber === destinationAccountNumber),
    [accounts, destinationAccountNumber]
  );

  const currencyTypes = useMemo(
    () => Array.from(new Set(accounts.map((account) => account.currency))),
    [accounts]
  );

  const fromCurrency = selectedAccount?.currency || 'GTQ';
  const activeFromCurrency = fromCurrency;
  const availableBalance = Number(selectedAccount?.balance ?? 0);

  const destinationAccounts = useMemo(() => {
    const differentCurrency = accounts.filter(
      (account) => account.accountNumber !== selectedAccountNumber && account.currency !== selectedAccount?.currency
    );

    if (differentCurrency.length > 0) {
      return differentCurrency;
    }

    return accounts.filter((account) => account.accountNumber !== selectedAccountNumber);
  }, [accounts, selectedAccount, selectedAccountNumber]);

  const loadAccounts = async () => {
    if (!authUser?.id) return;

    setAccountLoading(true);
    try {
      const response = await getBankProfileByUserId(authUser.id);
      const profile = response.profile;
      const accountNumbers = Array.isArray(profile?.accountNumbers) ? profile.accountNumbers : [];

      const loadedAccounts = [];
      const batchSize = 3;
      for (let i = 0; i < accountNumbers.length; i += batchSize) {
        const batch = accountNumbers.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (accountNumber) => {
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
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      setAccounts(loadedAccounts);
      console.log('[Conversion] loadAccounts loaded:', loadedAccounts.map(a => ({ accountNumber: a.accountNumber, balance: a.balance, currency: a.currency })));
      if (!selectedAccountNumber && loadedAccounts.length > 0) {
        setSelectedAccountNumber(loadedAccounts[0].accountNumber);
      }
    } catch (err) {
      setAccounts([]);
    } finally {
      setAccountLoading(false);
    }
  };

  const refreshAccounts = async (accountNumbers) => {
    if (!accountNumbers?.length) return;

    try {
      console.log('[Conversion] refreshAccounts request for:', accountNumbers);
      const batchSize = 3;
      const updatedAccounts = [];
      for (let i = 0; i < accountNumbers.length; i += batchSize) {
        const batch = accountNumbers.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map(async (accountNumber) => {
            try {
              const res = await getOperationalAccount(accountNumber);
              return {
                accountNumber,
                currency: res.account?.currency || 'GTQ',
                balance: Number(res.account?.balance ?? 0),
                status: res.account?.status || 'ACTIVA',
              };
            } catch {
              return null;
            }
          })
        );
        updatedAccounts.push(...batchResults.filter(Boolean));
        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      setAccounts((prevAccounts) =>
        prevAccounts.map((account) => {
          const updated = updatedAccounts.find((item) => item?.accountNumber === account.accountNumber);
          return updated || account;
        })
      );

      console.log('[Conversion] refreshAccounts updated:', updatedAccounts.filter(Boolean));

      return updatedAccounts.filter(Boolean);
    } catch {
      console.error('[Conversion] refreshAccounts failed for:', accountNumbers);
      // No action: keep existing local balances if backend refresh fails.
      return null;
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [authUser]);

  useEffect(() => {
    if (!selectedAccountNumber && sourceAccounts.length > 0) {
      setSelectedAccountNumber(sourceAccounts[0].accountNumber);
    }
  }, [sourceAccounts, selectedAccountNumber]);

  useEffect(() => {
    if (!selectedAccount) {
      setDestinationAccountNumber('');
      return;
    }

    if (destinationAccounts.some((account) => account.accountNumber === destinationAccountNumber)) {
      return;
    }

    setDestinationAccountNumber(destinationAccounts[0]?.accountNumber || '');
  }, [selectedAccount, destinationAccounts, destinationAccountNumber]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setResult(null);

    const amountValue = Number(amount);
    if (!selectedAccount) {
      setError('Selecciona una cuenta de origen para debitar.');
      return;
    }

    if (!destinationAccount) {
      setError('Selecciona una cuenta de destino válida.');
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
      // perform transfer via core-banking service which applies conversion server-side
      const transferResp = await createTransfer({
        fromAccountNumber: selectedAccount.accountNumber,
        toAccountNumber: destinationAccount.accountNumber,
        amount: amountValue,
        description: `Conversión desde ${selectedAccount.accountNumber} a ${destinationAccount.accountNumber}`,
      });

      console.log('[Conversion] createTransfer response:', transferResp);

      const transferResult = transferResp.result || transferResp;
      const convertedAmount = Number(transferResult?.conversion?.convertedAmount ?? transferResult?.conversion?.converted_amount ?? transferResult?.conversion?.convertedAmountBeforeCommission ?? 0);

      // normalize result object for UI (mimic previous conversion quote shape)
      const data = {
        amount: amountValue,
        fromCurrency: selectedAccount.currency,
        toCurrency: destinationAccount.currency,
        exchangeRate: transferResult?.conversion?.exchangeRate || transferResult?.conversion?.exchange_rate,
        commissionAmount: transferResult?.conversion?.commissionAmount || transferResult?.conversion?.commission_amount || 0,
        commissionPercent: transferResult?.conversion?.commissionPercent || transferResult?.conversion?.commission_percent || 0,
        convertedAmount,
      };
      setResult(data);
      const updatedAccounts = [
        {
          accountNumber: selectedAccount.accountNumber,
          currency: selectedAccount.currency,
          balance: Number(selectedAccount.balance) - amountValue,
          status: selectedAccount.status,
        },
        {
          accountNumber: destinationAccount.accountNumber,
          currency: destinationAccount.currency,
          balance: Number(destinationAccount.balance) + convertedAmount,
          status: destinationAccount.status,
        },
      ];

      setAccounts((prevAccounts) =>
        prevAccounts.map((account) => {
          const updated = updatedAccounts.find((item) => item.accountNumber === account.accountNumber);
          return updated ? { ...account, ...updated } : account;
        })
      );

      setSuccess(
        `Conversión realizada: se descontaron ${formatMoney(amountValue, selectedAccount.currency)} de ${selectedAccount.accountNumber} y se agregaron ${formatMoney(convertedAmount, destinationAccount.currency)} a ${destinationAccount.accountNumber}.`
      );

      console.log('[Conversion] about to refresh server balances for affected accounts');
      const serverUpdated = await refreshAccounts([selectedAccount.accountNumber, destinationAccount.accountNumber]);
      console.log('[Conversion] serverUpdated result:', serverUpdated);
      console.log('[Conversion] serverUpdated balances:',
        (serverUpdated || []).map((account) => ({
          accountNumber: account.accountNumber,
          balance: account.balance,
          currency: account.currency,
        }))
      );

      const eventAccounts = Array.isArray(serverUpdated) && serverUpdated.length > 0 ? serverUpdated : updatedAccounts;

      // ensure local state matches server if available
      if (Array.isArray(serverUpdated) && serverUpdated.length > 0) {
        setAccounts((prev) =>
          prev.map((account) => {
            const updated = serverUpdated.find((a) => a.accountNumber === account.accountNumber);
            return updated ? { ...account, ...updated } : account;
          })
        );
      }

      console.log('[Conversion] dispatching bankProfileUpdated with:', eventAccounts);
      window.dispatchEvent(new CustomEvent('bankProfileUpdated', { detail: { updatedAccounts: eventAccounts } }));
      markBankProfileUpdated?.();
    } catch (err) {
      console.error('[Conversion] handleSubmit error:', err);
      if (err.response?.status === 429) {
        setError('Demasiadas solicitudes, intenta nuevamente en unos segundos.');
      } else {
        setError(
          err.response?.data?.message || err.message || 'Error realizando la conversión'
        );
      }
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
        <div className='grid gap-4 lg:grid-cols-3'>
          <label className='space-y-2 text-sm text-slate-300'>
            Cuenta de origen
            <select
              value={selectedAccountNumber}
              onChange={(e) => setSelectedAccountNumber(e.target.value)}
              disabled={accountLoading || sourceAccounts.length === 0}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
            >
              <option value=''>Selecciona una cuenta</option>
              {sourceAccounts.map((account) => (
                <option key={account.accountNumber} value={account.accountNumber}>
                  {account.accountNumber} · {account.currency} · {formatMoney(account.balance, account.currency)}
                </option>
              ))}
            </select>
          </label>

          <label className='space-y-2 text-sm text-slate-300'>
            Cuenta de destino
            <select
              value={destinationAccountNumber}
              onChange={(e) => setDestinationAccountNumber(e.target.value)}
              disabled={accountLoading || destinationAccounts.length === 0}
              className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
            >
              <option value=''>Selecciona una cuenta destino</option>
              {destinationAccounts.length > 0 ? (
                destinationAccounts.map((account) => (
                  <option key={account.accountNumber} value={account.accountNumber}>
                    {account.accountNumber} · {account.currency} · {formatMoney(account.balance, account.currency)}
                  </option>
                ))
              ) : (
                <option value='' disabled>No hay cuentas destino disponibles</option>
              )}
            </select>
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
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <label className='space-y-2 text-sm text-slate-300'>
            Moneda origen
            <div className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'>
              {fromCurrency}
            </div>
          </label>

          <label className='space-y-2 text-sm text-slate-300'>
            Moneda destino
            <div className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'>
              {destinationAccount?.currency || 'Selecciona destino'}
            </div>
          </label>

          <div className='rounded-2xl border border-slate-700 bg-slate-950/80 p-4 text-slate-200'>
            <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>Saldo disponible</p>
            <p className='mt-2 text-sm text-white'>
              {selectedAccount ? formatMoney(availableBalance, selectedAccount.currency) : 'Selecciona una cuenta origen'}
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

        {success && (
          <div className='rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'>
            {success}
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
            <p><span className='font-semibold'>Saldo actual:</span> {formatMoney(selectedAccount.balance, selectedAccount.currency)}</p>
            {currencyTypes.length > 0 && (
              <p><span className='font-semibold'>Tipos de moneda:</span> {currencyTypes.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className='rounded-3xl bg-transparent p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white'>Resultado</h2>
          <div className='mt-4 space-y-3 text-sm text-slate-200'>
            <p>
              <span className='font-semibold'>Monto original:</span> {formatMoney(result.amount, result.fromCurrency)}
            </p>
            <p>
              <span className='font-semibold'>Tasa de cambio:</span> {result.exchangeRate}
            </p>
            <p>
              <span className='font-semibold'>Comisión:</span> {formatMoney(result.commissionAmount, result.toCurrency)} ({result.commissionPercent}%)
            </p>
            <p>
              <span className='font-semibold'>Total convertido:</span> {formatMoney(result.convertedAmount, result.toCurrency)}
            </p>
            <p>
              <span className='font-semibold'>Saldo estimado restante:</span>{' '}
              {formatMoney(availableBalance - Number(amount), activeFromCurrency)}
            </p>
            <p>
              <span className='font-semibold'>Equivalente en destino:</span>{' '}
              {formatMoney(result.convertedAmount, result.toCurrency)}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
