import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { UserDetailModal } from './UserDetailModal.jsx';
import { showError } from '../../../shared/utils/toast.js';
import { showSuccess } from '../../../shared/utils/toast.js';
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
  useEffect(() => {
    getAllUsers();
  }, [getAllUsers]);
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
  const handleCreate = async (formData) => {
    const res = await registerUser(formData);
    if (res.success) {
      showSuccess('Usuario creado. Se envió correo de verificación.');
      setOpenCreateModal(false);
      await getAllUsers(undefined, { force: true });
      return true;
    }
    showError(res.error || 'No se pudo crear el usuario');
    return false;
  };

  const handleOpenDetail = (user) => {
    setSelectedUser(user);
    setOpenEditModal(true);
  };

  const handleSaveUser = async (userId, formData) => {
    const res = await updateUser(userId, formData);
    if (res.success) {
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
          showSuccess(`Usuario ${isCurrentlyEnabled ? 'deshabilitado' : 'habilitado'} correctamente.`);
        } else {
          showError(res.error || `No se pudo ${action} el usuario`);
        }
      },
      onCancel: () => { },
    });
  };
  if (usersLoading && users.length === 0) return <Spinner />;
  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-semibold text-slate-900'>Usuarios</h1>
          <p className='text-slate-600 text-sm'>
            Gestión de usuarios del sistema bancario
          </p>
        </div>

        <button
          className='bg-slate-900 px-5 py-2.5 rounded-lg text-white hover:bg-slate-800 transition'
          onClick={() => setOpenCreateModal(true)}
        >
          + Agregar usuario
        </button>
      </div>

      <div className='bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-5'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre o usuario'
            className='md:col-span-2 w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-slate-600 focus:ring-1 focus:ring-slate-300 outline-none'
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-slate-600 focus:ring-1 focus:ring-slate-300 outline-none'
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN_ROLE'>ADMIN_ROLE</option>
            <option value='USER_ROLE'>USER_ROLE</option>
          </select>
        </div>
      </div>

      <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <div className='max-h-[720px] overflow-y-auto'>
            <table className='min-w-full text-sm'>
              <thead className='bg-[#0A1F44] text-white uppercase tracking-[0.05em] text-xs'>
                <tr>
                  <th className='text-left px-5 py-4 font-medium'>Nombre</th>
                  <th className='text-left px-5 py-4 font-medium'>Username</th>
                  <th className='text-left px-5 py-4 font-medium'>Rol</th>
                  <th className='text-right px-5 py-4 font-medium'>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td className='px-4 py-6 text-center text-gray-500' colSpan={4}>
                      No hay usuarios para mostrar.
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((u) => (
                    <tr key={u.id} className='border-t hover:bg-gray-50'>
                      <td className='px-4 py-3 font-medium text-gray-800'>
                        {[u.name, u.surname].filter(Boolean).join(' ') || '-'}
                      </td>
                      <td className='px-4 py-3 text-gray-700'>@{u.username}</td>
                      <td className='px-5 py-4'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${u.role === 'ADMIN_ROLE'
                              ? 'bg-[#0A1F44] text-white'
                              : 'bg-[#0A1F44] text-white'
                            }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-right space-x-2'>
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className='flex flex-col md:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-200 bg-slate-50'>
          <p className='text-xs text-slate-600'>
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
              className='px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400'
            >
              Anterior
            </button>
            <span className='px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg'>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-slate-400'
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
