import { useCallback, useEffect, useMemo, useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { UserDetailModal } from './UserDetailModal.jsx';
import { showError } from '../../../shared/utils/toast.js';
import { showSuccess } from '../../../shared/utils/toast.js';
import { getBankProfiles } from '../../../shared/apis/bank.js';
import { getOperationalAccount } from '../../../shared/apis/coreBanking.js';
const PAGE_SIZE = 5;

export const Users = () => {
  const { users, loading: usersLoading, error: usersError, getAllUsers, updateUser, toggleUserStatus } = useUserManagementStore();
  const registerUser = useAuthStore((state) => state.register);
  const authLoading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);
  const openConfirm = useUIStore((state) => state.openConfirm);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserData, setNewUserData] = useState({
    name: '',
    surname: '',
    username: '',
    phone: '',
    dpi: '',
    address: '',
    jobTitle: '',
    monthlyIncome: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilePhoto: '',
    role: 'USER_ROLE',
  });
  const [newUserError, setNewUserError] = useState('');
  const [newUserSuccess, setNewUserSuccess] = useState('');
  const [systemActivities, setSystemActivities] = useState([]);
  const [bankData, setBankData] = useState([]);
  const [totalBankBalance, setTotalBankBalance] = useState(0);
  
  const loadBankData = useCallback(async () => {
    try {
      const response = await getBankProfiles();
      console.log('Respuesta del banco:', response);
      
      // Extraer los perfiles correctamente
      const profiles = Array.isArray(response) ? response : (response.profiles || []);
      
      let total = 0;
      const dataByProfile = [];
      
      // Para cada perfil, obtener el saldo de sus cuentas
      for (const profile of profiles) {
        let profileBalance = 0;
        
        // Obtener saldo de cada cuenta con límite de concurrencia para evitar 429
        if (profile.accountNumbers && Array.isArray(profile.accountNumbers)) {
          const batchSize = 3;
          for (let i = 0; i < profile.accountNumbers.length; i += batchSize) {
            const batch = profile.accountNumbers.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (accountNumber) => {
                try {
                  const accountData = await getOperationalAccount(accountNumber);
                  const balance = accountData.account?.balance || 0;
                  profileBalance += balance;
                } catch (err) {
                  console.error(`Error al obtener cuenta ${accountNumber}:`, err);
                }
              })
            );
            await new Promise((resolve) => setTimeout(resolve, 120));
          }
        }
        
        if (profileBalance > 0) {
          total += profileBalance;
          
          // Buscar el nombre del usuario en la lista de usuarios
          const user = users.find(u => u.id === profile.userId);
          const userName = user?.name || `${user?.surname || ''}`.trim() || profile.userId;
          
          dataByProfile.push({
            name: userName,
            balance: profileBalance,
            userId: profile.userId
          });
        }
      }
      
      // Ordenar por saldo descendente
      dataByProfile.sort((a, b) => b.balance - a.balance);
      
      console.log('Datos para gráfica:', dataByProfile);
      console.log('Total:', total);
      
      setTotalBankBalance(total);
      setBankData(dataByProfile.slice(0, 5));
    } catch (err) {
      console.error('Error al cargar datos del banco:', err);
      setBankData([]);
    }
  }, [users]);
  
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);

  useEffect(() => {
    if (users.length > 0) {
      loadBankData();
    }
  }, [users, loadBankData]);

  useEffect(() => {
    if (systemActivities.length === 0 && users.length > 0) {
      setSystemActivities(getRecentActivities());
    }
  }, [users, systemActivities.length]);

  useEffect(() => {
    if (usersError) {
      showError(usersError);
    }
  }, [usersError]);
  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.name || ''} ${u.surname || ''}`
        .trim()
        .toLowerCase();
      const username = (u.username || '').toLowerCase();
      const role = (u.role || '').toUpperCase();
      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        username.includes(normalizedSearch);
      const matchesRole =
        roleFilter === 'ALL' ? true : role === roleFilter.toUpperCase();
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const totalUsers = filteredUsers.length;
  const activeCount = filteredUsers.filter((u) => u.status).length;
  const inactiveCount = totalUsers - activeCount;
  const handleCreate = async (formData) => {
    const res = await registerUser(formData);
    if (res.success) {
      showSuccess('Usuario creado. Se envió correo de verificación.');
      setOpenCreateModal(false);
      setSystemActivities((prev) => [
        {
          user: {
            name: formData.name || formData.username,
            username: formData.username,
          },
          action: 'Usuario creado',
          actionColor: 'text-emerald-400',
          time: new Date().toLocaleString(),
        },
        ...prev,
      ].slice(0, 10));
      await getAllUsers(undefined, { force: true });
      return true;
    }
    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  const handleInlineCreate = async (event) => {
    event.preventDefault();
    setNewUserError('');
    setNewUserSuccess('');

    if (!newUserData.name || !newUserData.username || !newUserData.email || !newUserData.password) {
      setNewUserError('Debe completar los campos obligatorios.');
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      setNewUserError('Las contraseñas no coinciden.');
      return;
    }

    const res = await handleCreate(newUserData);
    if (res) {
      setNewUserData({
        name: '',
        surname: '',
        username: '',
        phone: '',
        dpi: '',
        address: '',
        jobTitle: '',
        monthlyIncome: '',
        email: '',
        password: '',
        confirmPassword: '',
        profilePhoto: '',
        role: 'USER_ROLE',
      });
      setNewUserSuccess('Usuario agregado correctamente.');
    } else {
      setNewUserError('No se pudo agregar el usuario. Revisa los datos.');
    }
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleSaveUser = async (userId, formData) => {
    const res = await updateUser(userId, formData);
    if (res.success) {
      const updatedUser = {
        ...(selectedUser || {}),
        role: formData.get('role') || selectedUser?.role,
      };
      setSystemActivities((prev) => [
        {
          user: updatedUser,
          action: 'Perfil modificado',
          actionColor: 'text-emerald-400',
          time: new Date().toLocaleString(),
        },
        ...prev,
      ].slice(0, 10));

      showSuccess('Usuario actualizado correctamente.');
      setOpenEditModal(false);
      setSelectedUser(null);
      return true;
    }
    showError(res.error || 'No se pudo actualizar el usuario');
    return false;
  };

  const handleToggleUserStatus = (user) => {
    const isCurrentlyEnabled = user.status;
    const action = isCurrentlyEnabled ? 'deshabilitar' : 'habilitar';

    openConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      message: `¿Estás seguro de ${action} a ${user.username}?`,
      onConfirm: async () => {
        const res = await toggleUserStatus(user);
        if (res.success) {
          setSystemActivities((prev) => [
            {
              user,
              action: isCurrentlyEnabled ? 'Usuario deshabilitado' : 'Usuario habilitado',
              actionColor: isCurrentlyEnabled ? 'text-slate-500' : 'text-emerald-400',
              time: new Date().toLocaleString(),
            },
            ...prev,
          ].slice(0, 10));
          showSuccess(`Usuario ${isCurrentlyEnabled ? 'deshabilitado' : 'habilitado'} correctamente.`);
        } else {
          showError(res.error || `No se pudo ${action} el usuario`);
        }
      },
      onCancel: () => { },
    });
  };

  const getRecentActivities = () => {
    return users.slice().reverse().slice(0, 5).map((u) => ({
      user: u,
      action: u.status ? 'Cuenta activa' : 'Cuenta inactiva',
      actionColor: u.status ? 'text-emerald-400' : 'text-slate-500',
      time: 'Recientemente',
    }));
  };

  const getAvatarColor = (index) => {
    const colors = ['bg-blue-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-green-600'];
    return colors[index % colors.length];
  };
  if (usersLoading && users.length === 0) return <Spinner />;
  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-semibold text-white'>Usuarios</h1>
          <p className='text-sm text-slate-300'>Gestión de usuarios</p>
        </div>
        <button
          type='button'
          onClick={() => setOpenCreateModal(true)}
          className='bg-red-600 hover:bg-red-800 text-white rounded-lg px-5 py-3 text-sm font-medium transition'
        >
          + Agregar usuario
        </button>
      </div>
     <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>

  <div className='lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4'>
    <div className='bg-white/5 rounded-xl p-6 h-80 flex flex-col items-center justify-center text-center'>
      <span className='text-lg text-slate-300'>Usuarios totales</span>
      <span className='text-3xl font-bold text-white'>{totalUsers}</span>
      <span className='text-xs text-slate-400 mt-2'>Total de usuarios</span>
    </div>
    <div className='bg-white/5 rounded-xl p-6 h-80 flex flex-col items-center justify-center text-center'>
      <span className='text-lg text-slate-300'>Activos</span>
      <span className='text-3xl font-bold text-white'>{activeCount}</span>
      <span className='text-xs text-slate-400 mt-2'>
        +{Math.max(0, activeCount)} hoy
      </span>
    </div>
    <div className='bg-white/5 rounded-xl p-6 h-80 flex flex-col items-center justify-center text-center'>
      <span className='text-lg text-slate-300'>Inactivos</span>
      <span className='text-3xl font-bold text-white'>{inactiveCount}</span>
      <span className='text-xs text-slate-400 mt-2'>
        -{Math.max(0, inactiveCount)} hoy
      </span>
    </div>

  </div>
  <div className='hidden lg:flex flex-col gap-4'>
    <div className='bg-white/5 rounded-xl p-4 h-full flex flex-col'>
      <h3 className='text-sm text-slate-300 mb-2 text-left'>
         Dinero Total en el Banco
      </h3>
      <div className='text-2xl font-bold text-green-400 mb-4'>
        $ {totalBankBalance.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      <div className='flex-1'>
        {bankData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bankData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '0.5rem',
                  color: '#ffffff'
                }}
                formatter={(value) => `$ ${value.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="balance" fill="#ffffff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className='h-48 flex items-center justify-center text-slate-400'>
            Cargando datos del banco...
          </div>
        )}
      </div>
    </div>
  </div>
</div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
        <div className='lg:col-span-2 bg-white/5 rounded-2xl p-4'>
          <h3 className='text-sm text-slate-300 mb-4'>Clientes activos vs inactivos</h3>
          <div className='h-76 rounded-lg bg-gradient-to-b  flex items-center justify-center'>
            {totalUsers > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Activos', value: activeCount, fill: '#ff0101' },
                      { name: 'Inactivos', value: inactiveCount, fill: '#6b7280' }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value, percent }) =>
                      `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={{ stroke: '#ffffff' }}
                  >
                    <Cell fill="#ff0101" />
                    <Cell fill="#ffffff" />
                  </Pie>

                  <Tooltip
                    formatter={(value) => value}
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '0.5rem',
                      color: '#ffffff'
                    }}
                    labelStyle={{ color: '#ffffff' }}
                  />

                  <Legend
                    align='left'
                    verticalAlign='top'
                    wrapperStyle={{
                      color: '#ffffff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className='text-slate-400'>No hay datos disponibles</div>
            )}
          </div>
        </div>
        <div className='bg-white/5 rounded-2xl p-4'>
          <h3 className='text-sm text-slate-300 mb-4'>Actividad reciente del sistema</h3>
          <div className='space-y-3 text-sm text-slate-200'>
            {systemActivities.map((activity, idx) => (
              <div key={`${activity.user.id}-${idx}`} className='flex items-center justify-between p-2 rounded hover:bg-white/5 transition'>
                <div className='flex items-center gap-3 flex-1 min-w-0'>
                  <div className={`h-8 w-8 rounded-full ${getAvatarColor(idx)} flex items-center justify-center text-xs text-white font-semibold flex-shrink-0`}>
                    {activity.user.name ? activity.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-semibold truncate'>{activity.user.name || activity.user.username}</div>
                    <div className={`text-xs ${activity.actionColor}`}>{activity.action}</div>
                  </div>
                </div>
                <div className='text-xs text-slate-500 flex-shrink-0 ml-2'>{activity.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className='bg-transparent rounded-2xl border border-gray-900 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <div className='max-h-[720px] overflow-y-auto'>
            <table className='min-w-full text-sm'>
              <thead className='bg-[#0A1F44] text-white uppercase tracking-[0.05em] text-xs'>
                <tr>
                  <th className='text-left px-5 py-4 font-medium text-white'>Nombre</th>
                  <th className='text-left px-5 py-4 font-medium text-white'>Username</th>
                  <th className='text-left px-5 py-4 font-medium text-white'>Rol</th>
                  <th className='text-center px-5 py-4 font-medium text-white'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td className='px-4 py-6 text-center text-white' colSpan={4}>
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className='border-t border-gray-900 hover:bg-gray-500'>
                      <td className='px-4 py-3 font-medium text-white text-left'>
                        {[u.name, u.surname].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td className='px-4 py-3 text-white text-left'>@{u.username}</td>
                      <td className='px-4 py-3 text-left'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN_ROLE'
                            ? 'bg-[#0A1F44] text-white'
                            : 'bg-[#0A1F44] text-white'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-center'>
                        <div className='inline-flex items-center justify-center gap-2'>
                          <button
                            onClick={() => handleOpenDetail(u)}
                            className='w-24 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition'
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`w-28 px-3 py-2 rounded-lg text-white text-xs font-semibold hover:opacity-95 transition ${u.status ? 'bg-slate-700 hover:bg-slate-800' : 'bg-slate-500 hover:bg-slate-600'
                              }`}
                          >
                            {u.status ? 'Deshabilitar' : 'Habilitar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='flex flex-col md:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-900 bg-transparent'>
          <p className='text-xs text-slate-200'>
            Mostrando{' '}
            {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
            {' - '}
            {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de{' '}
            {filteredUsers.length}
          </p>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='px-3 py-2 rounded-lg border border-gray-900 bg-gray-900 text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-700'
            >
              Anterior
            </button>
            <span className='px-3 py-2 text-sm text-slate-200 bg-gray-900 border border-gray-900 rounded-lg'>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-2 rounded-lg border border-gray-900 bg-gray-900 text-sm text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-700'
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <CreateUserModal
        isOpen={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onCreate={handleCreate}
        loading={authLoading}
        error={authError}
      />

      <UserDetailModal
        key={selectedUser?.id || 'no-user'}
        isOpen={openEditModal}
        onClose={() => {
          setOpenEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSave={handleSaveUser}
        loading={usersLoading}
      />
    </div>
  );
};
