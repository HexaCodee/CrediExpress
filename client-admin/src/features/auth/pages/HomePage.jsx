import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { getBankProfileByUserId } from '../../../shared/apis/bank.js';
import { getOperationalAccount, getRecentMovements } from '../../../shared/apis/coreBanking.js';
import { normalizeUserModel } from '../../../shared/utils/user.js';

export const HomePage = () => {
    const rawAuthUser = useAuthStore((s) => s.user);
    const authUser = useMemo(() => normalizeUserModel(rawAuthUser) || rawAuthUser, [rawAuthUser]);

    const [bankProfile, setBankProfile] = useState(null);
    const [accountDetails, setAccountDetails] = useState({});
    const [movementsCache, setMovementsCache] = useState({});
    const [openAccount, setOpenAccount] = useState('');
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [loadingMovements, setLoadingMovements] = useState({});

    const formatAmount = (value) => {
        const amount = Number(value);
        if (Number.isNaN(amount)) return '0.00';
        return amount.toLocaleString('es-GT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const movementLabel = (movement) => {
        if (!movement) return '';
        if (movement.type === 'DEPOSIT') return 'Depósito';
        if (movement.type === 'TRANSFER_OUT') return 'Gasto';
        if (movement.type === 'TRANSFER_IN') return 'Ingreso';
        return movement.description || 'Movimiento';
    };

    const loadBankProfile = async () => {
        const userId = authUser?.id || authUser?.Id;
        if (!userId) return;

        setLoadingAccounts(true);
        try {
            const response = await getBankProfileByUserId(userId);
            const profile = response.profile;
            setBankProfile(profile);

            if (profile?.accountNumbers?.length > 0) {
                const details = {};
                await Promise.all(
                    profile.accountNumbers.map(async (accountNumber) => {
                        try {
                            const res = await getOperationalAccount(accountNumber);
                            details[accountNumber] = res.account || {};
                        } catch {
                            details[accountNumber] = null;
                        }
                    })
                );
                setAccountDetails(details);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setBankProfile(null);
            }
        } finally {
            setLoadingAccounts(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            loadBankProfile();
        }
    }, [authUser]);

    const handleToggleAccount = async (accountNumber) => {
        setOpenAccount((prev) => (prev === accountNumber ? '' : accountNumber));
        if (movementsCache[accountNumber] || loadingMovements[accountNumber]) return;

        setLoadingMovements((prev) => ({ ...prev, [accountNumber]: true }));
        try {
            const res = await getRecentMovements(accountNumber, 6);
            setMovementsCache((prev) => ({ ...prev, [accountNumber]: res.history || [] }));
        } catch {
            setMovementsCache((prev) => ({ ...prev, [accountNumber]: [] }));
        } finally {
            setLoadingMovements((prev) => ({ ...prev, [accountNumber]: false }));
        }
    };

    const accountSummary = useMemo(() => {
        const accountNumbers = bankProfile?.accountNumbers || [];
        const accounts = accountNumbers
            .map((accountNumber) => accountDetails[accountNumber])
            .filter(Boolean);
        const movements = accountNumbers.flatMap((accountNumber) => movementsCache[accountNumber] || []);

        const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0);
        const deposits = movements.filter((m) => m.type === 'DEPOSIT' || m.type === 'TRANSFER_IN').length;
        const expenses = movements.filter((m) => m.type === 'TRANSFER_OUT').length;
        const latestMovement = movements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        return {
            totalBalance,
            totalAccounts: accountNumbers.length,
            totalDeposits: deposits,
            totalExpenses: expenses,
            latestMovement,
        };
    }, [bankProfile, accountDetails, movementsCache]);

    if (!authUser) return <p className='text-slate-200'>Cargando tu inicio...</p>;

    return (
        <section>
            <header className='rounded-3xl p-6 '>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div>
                        <h1 className='text-3xl font-semibold text-white'>Bienvenido de nuevo, {authUser.name || authUser.Username || authUser.username || 'usuario'}</h1>
                    </div>
                </div>
            </header>

            <section className='rounded-3xl '>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    <div>
                        <h2 className='text-xl font-semibold text-white'>Tus cuentas</h2>
                    </div>
                </div>

                <div className='mt-3 grid gap-2 md:grid-cols-3'>
                    <div className='rounded-2xl border border-slate-700 bg-slate-950/70 p-3'>
                        <p className='text-[10px] uppercase tracking-[0.18em] text-slate-500'>
                            Cuentas activas
                        </p>
                        <p className='mt-2 text-2xl font-semibold text-white'>
                            {accountSummary.totalAccounts || 0}
                        </p>
                    </div>

                    <div className='rounded-2xl border border-slate-700 bg-slate-950/70 p-3'>
                        <p className='text-[10px] uppercase tracking-[0.18em] text-slate-500'>
                            Saldo total
                        </p>
                        <p className='mt-2 text-2xl font-semibold text-white'>
                            $ {formatAmount(accountSummary.totalBalance)}
                        </p>
                    </div>

                    <div className='rounded-2xl border border-slate-700 bg-slate-950/70 p-3'>
                        <p className='text-[10px] uppercase tracking-[0.18em] text-slate-500'>
                            Movimientos visibles
                        </p>
                        <p className='mt-2 text-2xl font-semibold text-white'>
                            {accountSummary.totalDeposits + accountSummary.totalExpenses}
                        </p>
                    </div>
                </div>

                <div className='mt-4 space-y-3'>
  {loadingAccounts ? (
    <div className='text-sm text-slate-300'>Cargando tus cuentas...</div>
  ) : bankProfile?.accountNumbers?.length > 0 ? (
    bankProfile.accountNumbers.map((accountNumber) => {
      const detail = accountDetails[accountNumber];

      return (
        <article
          key={accountNumber}
          className='rounded-2xl border border-slate-700 bg-slate-950/60 p-4'
        >
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>
                Cuenta
              </p>

              <p className='mt-1 text-base font-semibold text-white'>
                {accountNumber}
              </p>

              <p className='mt-1 text-xs text-slate-400'>
                {detail?.currency || bankProfile.preferredCurrency || 'GTQ'} ·{' '}
                {detail?.status || 'ACTIVA'}
              </p>
            </div>

            <div className='grid gap-2 sm:grid-cols-3'>
              <div className='rounded-2xl bg-slate-900/80 p-3 text-center'>
                <p className='text-[10px] uppercase tracking-[0.18em] text-slate-500'>
                  Saldo total
                </p>

                <p className='mt-1 text-lg font-semibold text-white'>
                  $ {formatAmount(detail?.balance ?? 0)}
                </p>
              </div>

              <div className='rounded-2xl bg-slate-900/80 p-3 text-center'>
                <p className='text-[10px] uppercase tracking-[0.18em] text-slate-500'>
                  Principal
                </p>

                <p className='mt-1 text-base font-semibold text-white'>
                  {bankProfile.primaryAccountNumber === accountNumber ? 'Sí' : 'No'}
                </p>
              </div>

              <button
                type='button'
                onClick={() => handleToggleAccount(accountNumber)}
                className='rounded-2xl bg-sky-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-sky-400'
              >
                {openAccount === accountNumber
                  ? 'Ocultar detalles'
                  : 'Ver detalles'}
              </button>
            </div>
          </div>

          {openAccount === accountNumber && (
            <div className='mt-4 grid gap-3 lg:grid-cols-[1fr_auto]'>
              <div className='rounded-2xl border border-slate-800 bg-slate-950/80 p-3'>
                <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                  Resumen de actividad
                </p>

                <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                  <div className='rounded-2xl bg-slate-900/90 p-3'>
                    <p className='text-[11px] text-slate-400'>
                      Depósitos recientes
                    </p>

                    <p className='mt-1 text-base font-semibold text-emerald-400'>
                      {
                        (movementsCache[accountNumber] || []).filter(
                          (m) => m.type === 'DEPOSIT'
                        ).length
                      }
                    </p>
                  </div>

                  <div className='rounded-2xl bg-slate-900/90 p-3'>
                    <p className='text-[11px] text-slate-400'>
                      Gastos / retiros
                    </p>

                    <p className='mt-1 text-base font-semibold text-rose-400'>
                      {
                        (movementsCache[accountNumber] || []).filter(
                          (m) => m.type === 'TRANSFER_OUT'
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-800 bg-slate-950/80 p-3'>
                <p className='text-xs uppercase tracking-[0.18em] text-slate-500'>
                  Movimientos recientes
                </p>

                {loadingMovements[accountNumber] ? (
                  <p className='mt-2 text-sm text-slate-300'>
                    Cargando movimientos...
                  </p>
                ) : movementsCache[accountNumber]?.length ? (
                  <ul className='mt-3 space-y-2'>
                    {movementsCache[accountNumber].map((movement) => (
                      <li
                        key={movement._id || movement.id}
                        className='rounded-2xl border border-slate-800 bg-slate-900/80 p-3'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <div>
                            <p className='text-xs font-semibold text-white'>
                              {movementLabel(movement)}
                            </p>

                            <p className='mt-1 text-[11px] text-slate-400'>
                              {new Date(movement.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <p
                            className={`text-xs font-semibold ${
                              movement.type === 'DEPOSIT' ||
                              movement.type === 'TRANSFER_IN'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {movement.type === 'DEPOSIT' ||
                            movement.type === 'TRANSFER_IN'
                              ? '+'
                              : '-'}
                            {formatAmount(movement.amount)}{' '}
                            {movement.currency ||
                              detail?.currency ||
                              'GTQ'}
                          </p>
                        </div>

                        {movement.description && (
                          <p className='mt-2 text-xs text-slate-400'>
                            {movement.description}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className='mt-2 text-sm text-slate-400'>
                    No hay movimientos recientes disponibles.
                  </p>
                )}
              </div>
            </div>
          )}
        </article>
      );
    })
  ) : (
    <div className='rounded-2xl bg-slate-950/70 p-4 text-sm text-slate-300'>
      No se detectaron cuentas vinculadas a tu perfil.
    </div>
  )}
</div>
            </section>
        </section>
    );
};
