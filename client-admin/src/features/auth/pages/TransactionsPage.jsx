import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getBankProfileByUserId } from '../../../shared/apis/bank.js';
import { createTransfer, getOperationalAccount } from '../../../shared/apis/coreBanking.js';
import { normalizeUserModel } from '../../../shared/utils/user.js';

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '0.00';
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const TransactionsPage = () => {
  const rawAuthUser = useAuthStore((s) => s.user);
  const authUser = useMemo(() => normalizeUserModel(rawAuthUser) || rawAuthUser, [rawAuthUser]);

  const [bankProfile, setBankProfile] = useState(null);
  const [accountDetails, setAccountDetails] = useState({});
  const [selectedFromAccount, setSelectedFromAccount] = useState('');
  const [toAccountNumber, setToAccountNumber] = useState('');
  const [destinationInfo, setDestinationInfo] = useState(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(null);

  const loadBankProfile = async () => {
    const userId = authUser?.id || authUser?.Id;
    if (!userId) return;

    try {
      const response = await getBankProfileByUserId(userId);
      const profile = response.profile;
      setBankProfile(profile);
      const details = {};

      if (profile?.accountNumbers?.length > 0) {
        const batchSize = 3;
        for (let i = 0; i < profile.accountNumbers.length; i += batchSize) {
          const batch = profile.accountNumbers.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async (accountNumber) => {
              try {
                const res = await getOperationalAccount(accountNumber);
                details[accountNumber] = res.account || {};
              } catch {
                details[accountNumber] = null;
              }
            })
          );
          await new Promise((resolve) => setTimeout(resolve, 120));
        }
      }

      setAccountDetails(details);
      if (!selectedFromAccount && profile?.accountNumbers?.length > 0) {
        setSelectedFromAccount(profile.accountNumbers[0]);
      }
    } catch (err) {
      setBankProfile(null);
    }
  };

  useEffect(() => {
    if (authUser) {
      loadBankProfile();
    }
  }, [authUser]);

  useEffect(() => {
    if (!toAccountNumber || toAccountNumber.length < 8) {
      setDestinationInfo(null);
      setPreviewMessage(null);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await getOperationalAccount(toAccountNumber);
        setDestinationInfo(res.account || null);
        setPreviewMessage('Cuenta destino encontrada.');
      } catch {
        setDestinationInfo(null);
        setPreviewMessage('Cuenta destino no encontrada o no disponible.');
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [toAccountNumber]);

  const selectedAccount = selectedFromAccount ? accountDetails[selectedFromAccount] : null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedFromAccount) {
      setError('Selecciona la cuenta de origen.');
      return;
    }

    if (!toAccountNumber.trim()) {
      setError('Ingresa el número de cuenta destino.');
      return;
    }

    if (selectedFromAccount === toAccountNumber.trim()) {
      setError('La cuenta destino no puede ser la misma que la de origen.');
      return;
    }

    if (!destinationInfo) {
      setError('Cuenta destino no encontrada o no disponible.');
      return;
    }

    const sourceCurrency = (selectedAccount?.currency || '').toString().toUpperCase();
    const destinationCurrency = (destinationInfo?.currency || '').toString().toUpperCase();
    if (sourceCurrency && destinationCurrency && sourceCurrency !== destinationCurrency) {
      setError(`La transferencia solo se puede realizar entre cuentas con la misma moneda (${sourceCurrency}).`);
      return;
    }

    const transferAmount = Number(amount);
    if (Number.isNaN(transferAmount) || transferAmount <= 0) {
      setError('Ingresa un monto válido mayor a cero.');
      return;
    }

    if (selectedAccount && Number(selectedAccount.balance || 0) < transferAmount) {
      setError('Saldo insuficiente en la cuenta de origen.');
      return;
    }

    setLoading(true);

    try {
      await createTransfer({
        fromAccountNumber: selectedFromAccount,
        toAccountNumber: toAccountNumber.trim(),
        amount: transferAmount,
        description: description.trim() || `Transferencia a ${toAccountNumber.trim()}`,
      });

      setSuccess('Transferencia realizada correctamente. Los saldos se actualizaron.');
      setAmount('');
      setDescription('');
      setToAccountNumber('');
      setDestinationInfo(null);
      setPreviewMessage(null);
      await loadBankProfile();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error realizando la transferencia.');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) return <p className='text-slate-200'>Cargando transacciones...</p>;

  return (
    <section className='max-w-4xl mx-auto space-y-6'>
      <header className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700'>
        <h1 className='text-2xl font-semibold text-white'>Transferencias</h1>
        <p className='mt-2 text-sm text-slate-300'>Selecciona tu cuenta, ingresa la cuenta destino y haz la transferencia al instante.</p>
      </header>

      <div className='grid gap-6 lg:grid-cols-[1.3fr_0.9fr]'>
        <form onSubmit={handleSubmit} className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700 space-y-5'>
          <div className='grid gap-4'>
            <label className='space-y-2 text-sm text-slate-300'>
              Cuenta de origen
              <select
                value={selectedFromAccount}
                onChange={(e) => setSelectedFromAccount(e.target.value)}
                className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'
              >
                <option value='' disabled>Selecciona una cuenta</option>
                {bankProfile?.accountNumbers?.map((accountNumber) => (
                  <option key={accountNumber} value={accountNumber}>{accountNumber}</option>
                ))}
              </select>
            </label>

            {selectedAccount ? (
              <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200'>
                <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>Saldo disponible</p>
                <p className='mt-2 text-3xl font-semibold text-white'>{formatAmount(selectedAccount.balance)}</p>
                <p className='mt-1 text-sm text-slate-400'>Moneda: {selectedAccount.currency || bankProfile.preferredCurrency || 'GTQ'}</p>
              </div>
            ) : (
              <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-slate-400'>Selecciona una cuenta de origen para ver el saldo.</div>
            )}

            <label className='space-y-2 text-sm text-slate-300'>
              Cuenta destino
              <input
                type='text'
                value={toAccountNumber}
                onChange={(e) => setToAccountNumber(e.target.value)}
                placeholder='Número de cuenta destino'
                className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'
              />
            </label>

            {previewMessage && (
              <div className='rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200'>
                {previewMessage}
              </div>
            )}

            <label className='space-y-2 text-sm text-slate-300'>
              Monto a transferir
              <input
                type='number'
                min='0.01'
                step='0.01'
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder='0.00'
                className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'
              />
            </label>

            <label className='space-y-2 text-sm text-slate-300'>
              Descripción (opcional)
              <input
                type='text'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Ej. Pago a proveedor'
                className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white'
              />
            </label>
          </div>

          {error && <div className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200'>{error}</div>}
          {success && <div className='rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'>{success}</div>}

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? 'Procesando transferencia...' : 'Enviar transferencia'}
          </button>
        </form>

        <aside className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700 space-y-5'>
          <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4'>
            <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>Tus cuentas</p>
            <div className='mt-4 space-y-3'>
              {bankProfile?.accountNumbers?.length > 0 ? (
                bankProfile.accountNumbers.map((accountNumber) => {
                  const detail = accountDetails[accountNumber] || {};
                  return (
                    <div key={accountNumber} className='rounded-3xl border border-slate-800 bg-slate-950/80 p-4'>
                      <p className='text-sm text-slate-300'>{accountNumber}</p>
                      <p className='mt-2 text-lg font-semibold text-white'>{formatAmount(detail.balance)}</p>
                      <p className='text-xs text-slate-500'>Moneda: {detail.currency || bankProfile.preferredCurrency || 'GTQ'}</p>
                    </div>
                  );
                })
              ) : (
                <p className='text-sm text-slate-400'>No se encontraron cuentas vinculadas.</p>
              )}
            </div>
          </div>

          {destinationInfo && (
            <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4'>
              <p className='text-xs uppercase tracking-[0.24em] text-slate-400'>Información destino</p>
              <p className='mt-2 text-lg font-semibold text-white'>{destinationInfo.accountNumber}</p>
              <p className='mt-1 text-sm text-slate-400'>Saldo actual: {formatAmount(destinationInfo.balance)}</p>
            </div>
          )}

          <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-slate-300'>
            <p className='text-sm font-semibold text-white'>Instrucciones</p>
            <ul className='mt-3 space-y-2 text-sm'>
              <li>Selecciona la cuenta de origen.</li>
              <li>Ingresa la cuenta destino.</li>
              <li>Revisa el saldo antes de transferir.</li>
              <li>La operación se reflejará en el saldo de ambas cuentas.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
};
