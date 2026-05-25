import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../../users/store/useUserManagementStore.js';
import { getAccountTypes } from '../../../shared/apis/accountType.js';
import {
  createBankProfile,
  getBankProfileByUserId,
  updateBankProfile,
  getBankProfiles,
} from '../../../shared/apis/bank.js';
import {
  registerOperationalAccount,
  createDeposit,
  getRecentMovements,
  getAccountOverview,
} from '../../../shared/apis/coreBanking.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { showError } from '../../../shared/utils/toast.js';
import { showSuccess } from '../../../shared/utils/toast.js';

const DEFAULT_ACCOUNT_TYPES = [
  {
    id: 'SAVINGS',
    label: 'Cuenta de ahorro monetaria',
    description: 'Producto de ahorro seguro para depósitos y disponibilidad inmediata.',
  },
  {
    id: 'CURRENT',
    label: 'Cuenta corriente',
    description: 'Cuenta operativa para pagos y transferencias diarias.',
  },
  {
    id: 'FIXED_DEPOSIT',
    label: 'Depósito a plazo',
    description: 'Ahorro con tasa fija y fecha de vencimiento.',
  },
];

const DEFAULT_CURRENCIES = ['GTQ', 'USD', 'EUR'];

const generateAccountNumber = () => `5${Math.floor(100000000 + Math.random() * 900000000)}`;

const formatAmount = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '0.00';
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const BankAccountsPage = () => {
  const { users, loading: usersLoading, getAllUsers } = useUserManagementStore();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [currency, setCurrency] = useState('GTQ');
  const [initialDeposit, setInitialDeposit] = useState('500');
  const [riskLevel, setRiskLevel] = useState('LOW');
  const [notes, setNotes] = useState('Apertura de cuenta de ahorro monetaria con depósito inicial.');
  const [accountNumber, setAccountNumber] = useState(generateAccountNumber());
  const [existingBankProfile, setExistingBankProfile] = useState(null);
  const [accountTypes, setAccountTypes] = useState(DEFAULT_ACCOUNT_TYPES);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [movementsCache, setMovementsCache] = useState({}); 
  const [expandedAccounts, setExpandedAccounts] = useState({});

  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    const loadAccountTypes = async () => {
      try {
        const data = await getAccountTypes();
        if (Array.isArray(data?.accountTypes)) {
          setAccountTypes(
            data.accountTypes.map((item) => ({
              id: item.name || item._id || 'SAVINGS',
              label: item.name || 'Cuenta',
              description: item.description || '',
            }))
          );
        }
      } catch {
      }
    };

    loadAccountTypes();
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;

    const loadBankProfile = async () => {
      setLoadingProfile(true);
      try {
        const response = await getBankProfileByUserId(selectedUserId);
        setExistingBankProfile(response.profile);
      } catch (error) {
        if (error.response?.status === 404) {
          setExistingBankProfile(null);
        } else {
          showError(error.response?.data?.message || 'No se pudo cargar el perfil bancario del usuario.');
          setExistingBankProfile(null);
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    loadBankProfile();
  }, [selectedUserId]);

  useEffect(() => {
    const loadProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const response = await getBankProfiles();
        const list = response.profiles || response || [];
        const withAccounts = Array.isArray(list) ? list.filter(p => (p.accountNumbers || []).length > 0) : [];
        setProfiles(withAccounts);
      } catch (err) {
      } finally {
        setLoadingProfiles(false);
      }
    };

    loadProfiles();
  }, []);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [users, selectedUserId]
  );

  const handleGenerateAccountNumber = () => {
    setAccountNumber(generateAccountNumber());
  };

  const resetForm = () => {
    setAccountType('SAVINGS');
    setCurrency('GTQ');
    setInitialDeposit('500');
    setRiskLevel('LOW');
    setNotes('Apertura de cuenta de ahorro monetaria con depósito inicial.');
    setAccountNumber(generateAccountNumber());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUserId) {
      showError('Selecciona un usuario antes de crear la cuenta.');
      return;
    }

    if (!accountNumber) {
      showError('Genera un número de cuenta válido.');
      return;
    }

    const depositAmount = Number(initialDeposit);
    if (Number.isNaN(depositAmount) || depositAmount < 0) {
      showError('Ingresa un depósito inicial válido.');
      return;
    }

    setSubmitting(true);

    try {
      const profilePayload = {
        userId: selectedUserId,
        accountNumbers: [accountNumber],
        primaryAccountNumber: existingBankProfile?.primaryAccountNumber || accountNumber,
        preferredCurrency: currency,
        profileStatus: 'ACTIVE',
        riskLevel,
        notes,
      };

      let profileResponse;
      if (existingBankProfile) {
        const accountNumbers = Array.from(
          new Set([...(existingBankProfile.accountNumbers || []), accountNumber])
        );
        profileResponse = await updateBankProfile(selectedUserId, {
          accountNumbers,
          preferredCurrency: currency,
          riskLevel,
          notes,
        });
      } else {
        profileResponse = await createBankProfile(profilePayload);
      }

      await registerOperationalAccount({
        accountNumber,
        userId: selectedUserId,
        currency,
        status: 'ACTIVE',
        balance: 0,
      });

      if (depositAmount > 0) {
        await createDeposit({
          accountNumber,
          amount: depositAmount,
          description: `Depósito inicial para apertura de la cuenta ${accountType.toLowerCase()}`,
        });
      }

      showSuccess(
        `Cuenta bancaria creada con éxito para ${selectedUser?.username || selectedUser?.name}. Número: ${accountNumber}`
      );

      setExistingBankProfile(profileResponse.profile ?? null);
      resetForm();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Fallo al crear la cuenta bancaria.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleMovements = async (accountNumber) => {
    setExpandedAccounts(prev => ({ ...prev, [accountNumber]: !prev[accountNumber] }));
    if (movementsCache[accountNumber]) return;
    try {
      const res = await getRecentMovements(accountNumber, 5);
      const history = res.history || res || [];
      setMovementsCache(prev => ({ ...prev, [accountNumber]: history }));
    } catch (err) {
      setMovementsCache(prev => ({ ...prev, [accountNumber]: [] }));
    }
  };

  return (
    <section className='max-w-6xl mx-auto space-y-6'>
      <header className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700'>
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold text-white'>Administración de cuentas</h1>
            <p className='mt-2 text-sm text-slate-300'>Crea cuentas de ahorro comerciales para clientes desde el panel administrativo.</p>
          </div>
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-3'>
        <div className='rounded-3xl bg-slate-900/80 border border-slate-700 p-6 space-y-4'>
          <h2 className='text-xl font-semibold text-white'>Detalles del cliente</h2>
          {usersLoading ? (
            <Spinner />
          ) : (
            <div className='space-y-3 text-sm text-slate-200'>
              <label className='block'>
                <span className='text-slate-300'>Selecciona cliente</span>
                <select
                  value={selectedUserId}
                  onChange={(event) => {
                    const userId = event.target.value;
                    setSelectedUserId(userId);
                    if (!userId) {
                      setExistingBankProfile(null);
                    }
                  }}
                  className='mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                >
                  <option value=''>Seleccionar usuario</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ? `${user.name} ${user.surname || ''}`.trim() : user.username || user.email}
                    </option>
                  ))}
                </select>
              </label>

              {selectedUser && (
                <div className='rounded-3xl bg-slate-950/80 border border-slate-700 p-4'>
                  <p className='text-sm text-slate-400'>Cliente seleccionado</p>
                  <p className='mt-2 text-base font-semibold text-white'>{selectedUser.name || selectedUser.username}</p>
                  <p className='text-sm text-slate-400'>{selectedUser.email || selectedUser.username}</p>
                  <p className='text-sm text-slate-400'>{selectedUser.role || 'Cliente'}</p>
                </div>
              )}

              <div className='rounded-3xl bg-slate-950/60 border border-slate-700 p-4 space-y-2'>
                <p className='text-sm font-semibold text-white'>Estado de perfil</p>
                {loadingProfile ? (
                  <div className='flex items-center gap-2 text-slate-300'>
                    <Spinner small />
                    Cargando perfil bancario...
                  </div>
                ) : existingBankProfile ? (
                  <div className='space-y-2'>
                    <p className='text-sm text-slate-200'>Perfil existente</p>
                    <p className='text-sm text-slate-400'>Cuentas activas: {existingBankProfile.accountNumbers.length}</p>
                    <p className='text-sm text-slate-400'>Moneda preferida: {existingBankProfile.preferredCurrency}</p>
                    <p className='text-sm text-slate-400'>Riesgo: {existingBankProfile.riskLevel}</p>
                  </div>
                ) : (
                  <p className='text-sm text-slate-300'>Este cliente aún no tiene un perfil bancario. Puedes crearle una cuenta de ahorro segura.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className='lg:col-span-2 rounded-3xl bg-slate-900/80 border border-slate-700 p-6'>
          <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div>
              <h2 className='text-xl font-semibold text-white'>Crear cuenta de ahorro</h2>
              <p className='mt-2 text-sm text-slate-300'>Define la propuesta bancaria, monto inicial y fecha de apertura.</p>
            </div>
            <div className='rounded-3xl bg-slate-950/80 border border-slate-700 px-4 py-3 text-sm text-slate-200'>
              {existingBankProfile ? 'Agregando producto a perfil existente' : 'Apertura de nuevo perfil bancario'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className='mt-6 space-y-6'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <label className='space-y-2 text-sm text-slate-300'>
                Producto financiero
                <select
                  value={accountType}
                  onChange={(event) => setAccountType(event.target.value)}
                  className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                >
                  {accountTypes.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-2 text-sm text-slate-300'>
                Moneda de la cuenta
                <select
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value)}
                  className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                >
                  {DEFAULT_CURRENCIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className='space-y-2 text-sm text-slate-300'>
                Depósito inicial ({currency})
                <input
                  value={initialDeposit}
                  onChange={(event) => setInitialDeposit(event.target.value)}
                  type='number'
                  step='0.01'
                  min='0'
                  className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                  placeholder='500.00'
                />
              </label>

              <label className='space-y-2 text-sm text-slate-300'>
                Nivel de riesgo
                <select
                  value={riskLevel}
                  onChange={(event) => setRiskLevel(event.target.value)}
                  className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                >
                  <option value='LOW'>LOW</option>
                  <option value='MEDIUM'>MEDIUM</option>
                  <option value='HIGH'>HIGH</option>
                </select>
              </label>
            </div>

            <div className='grid gap-4 lg:grid-cols-2'>
              <label className='space-y-2 text-sm text-slate-300'>
                Número de cuenta
                <div className='flex gap-2'>
                  <input
                    value={accountNumber}
                    readOnly
                    className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none'
                  />
                  <button
                    type='button'
                    onClick={handleGenerateAccountNumber}
                    className='rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400'
                  >
                    Generar
                  </button>
                </div>
              </label>
            </div>

            <label className='space-y-2 text-sm text-slate-300'>
              Notas de apertura
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-sky-500'
                placeholder='Detalles adicionales del producto, condiciones de apertura o características del cliente.'
              />
            </label>

            <div className='rounded-3xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200'>
              <p className='text-sm text-slate-300'>Resumen de apertura</p>
              <ul className='mt-3 space-y-2 text-sm'>
                <li>Cliente: <strong>{selectedUser?.name || selectedUser?.username || 'Sin seleccion'}</strong></li>
                <li>Producto: <strong>{accountTypes.find((item) => item.id === accountType)?.label || accountType}</strong></li>
                <li>Monto inicial: <strong>{formatAmount(initialDeposit)} {currency}</strong></li>
                <li>Número de cuenta: <strong>{accountNumber}</strong></li>
                <li>Riesgo asignado: <strong>{riskLevel}</strong></li>
              </ul>
            </div>

            <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={resetForm}
                className='w-full sm:w-auto rounded-2xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-700'
              >
                Limpiar
              </button>
              <button
                type='submit'
                disabled={submitting || !selectedUserId}
                className='w-full sm:w-auto rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60'
              >
                {submitting ? 'Creando cuenta...' : existingBankProfile ? 'Agregar producto de ahorro' : 'Abrir cuenta de ahorro'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <section className='mt-8'>
        <header className='rounded-3xl bg-slate-900/80 p-4 shadow-xl border border-slate-700 mb-4'>
          <h2 className='text-xl font-semibold text-white'>Resumen: usuarios con cuentas y movimientos</h2>
          <p className='mt-1 text-sm text-slate-300'>Lista de usuarios que tienen cuentas operacionales, sus cuentas y movimientos recientes.</p>
        </header>

        {loadingProfiles ? (
          <div className='p-4 text-slate-300'>Cargando perfiles...</div>
        ) : (
          <div className='rounded-3xl bg-slate-900/80 border border-slate-700 p-4'>
            <table className='w-full table-auto text-sm text-left'>
              <thead>
                <tr className='text-slate-300'>
                  <th className='p-2'>Usuario</th>
                  <th className='p-2'>Cuentas</th>
                  <th className='p-2'>Movimientos recientes</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => {
                  const user = users.find(u => u.id === profile.userId) || { username: profile.userId };
                  return (
                    <tr key={profile.userId} className='border-t border-slate-800'>
                      <td className='p-3 align-top'>
                        <div className='font-medium text-white'>{user.name || user.username}</div>
                        <div className='text-slate-400 text-xs'>{user.email || user.username}</div>
                      </td>
                      <td className='p-3 align-top'>
                        <ul className='space-y-1'>
                          {((profile.accountNumbers || [])).map((acc) => (
                            <li key={acc} className='flex items-center justify-between gap-2'>
                              <span className='text-slate-200'>{acc}</span>
                              <button type='button' onClick={() => handleToggleMovements(acc)} className='ml-2 rounded px-2 py-1 text-xs bg-slate-800 text-slate-200'>
                                {expandedAccounts[acc] ? 'Ocultar' : 'Ver movimientos'}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className='p-3 align-top'>
                        {(profile.accountNumbers || []).map((acc) => (
                          <div key={acc} className='mb-3'>
                            {expandedAccounts[acc] && (
                              <div className='rounded bg-slate-950/60 p-3 border border-slate-800'>
                                {movementsCache[acc] ? (
                                  movementsCache[acc].length ? (
                                    <ul className='space-y-2 text-slate-200'>
                                      {movementsCache[acc].map((m) => (
                                        <li key={m._id || m.id} className='text-xs'>
                                          <div className='flex justify-between'>
                                            <span>{new Date(m.createdAt).toLocaleString()}</span>
                                            <span className='font-medium'>{m.type || m.description || ''} {m.amount ? `- ${formatAmount(m.amount)} ${m.currency || profile.preferredCurrency}` : ''}</span>
                                          </div>
                                          <div className='text-slate-400'>{m.description || ''}</div>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <div className='text-slate-400 text-sm'>Sin movimientos recientes</div>
                                  )
                                ) : (
                                  <div className='text-slate-400 text-sm'>Cargando movimientos...</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {profiles.length === 0 && <div className='mt-3 text-slate-400'>No se encontraron perfiles con cuentas.</div>}
          </div>
        )}
      </section>
    </section>
  );
};
