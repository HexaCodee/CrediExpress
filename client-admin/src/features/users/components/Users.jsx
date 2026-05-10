import { useEffect, useMemo, useState } from 'react';
import { useUserManagementStore } from '../store/useUserManagementStore.js';
import { useAuthStore } from '../../auth/store/authStore.js';
import { useUIStore } from '../../auth/store/uiStore.js';
import { Spinner } from '../../auth/components/Spinner.jsx';
import { CreateUserModal } from './CreateUserModal.jsx';
import { UserDetailModal } from './UserDetailModal.jsx';
import { showError } from '../../../shared/utils/toast.js';
import { showSuccess } from '../../../shared/utils/toast.js';
const PAGE_SIZE = 8;

export const Users = () => {
  // Solo lo necesario para listar
  const { users, loading: usersLoading, error: usersError, getAllUsers, updateUser, toggleUserStatus } = useUserManagementStore();
  // Funcionalidades no necesarias para listar (comentadas)
  // const { updateUserRole } = useUserManagementStore();
  const registerUser = useAuthStore((state) => state.register);
  const authLoading = useAuthStore((state) => state.loading);
  const authError = useAuthStore((state) => state.error);
  const openConfirm = useUIStore((state) => state.openConfirm);
  // const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  // Estados de modales/edición (comentados porque no se usarán por ahora)
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
  // Edición de usuario / cambio de rol (comentado)
  // const handleOpenDetail = (user) => {
  //   setSelectedUser(user);
  //   setOpenDetailModal(true);
  // };
  // const handleSaveRole = async (user, newRole) => {
  //   const res = await updateUserRole(user.id, newRole);
  //   if (res.success) {
  //     showSuccess("Rol actualizado correctamente");
  //     setOpenDetailModal(false);
  //     setSelectedUser(null);
  //   } else {
  //     showError(res.error || "Error al actualizar rol");
  //   }
  // };
  // Crear usuario (comentado)
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
    const newStatus = isCurrentlyEnabled ? 'false' : 'true';

    openConfirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} usuario`,
      message: `¿Estás seguro de ${action} a ${user.username}?`,
      onConfirm: async () => {
        const formData = new FormData();
        formData.append('status', newStatus);
        const res = await updateUser(user.id, formData);
        if (res.success) {
          showSuccess(`Usuario ${isCurrentlyEnabled ? 'deshabilitado' : 'habilitado'} correctamente.`);
        } else {
          showError(res.error || `No se pudo ${action} el usuario`);
        }
      },
      onCancel: () => {},
    });
  };
  if (usersLoading && users.length === 0) return <Spinner />;
  return (
    <div className='p-4'>
      <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6'>
        <div>
          <h1 className='text-3xl font-bold text-main-blue'>Usuarios</h1>
          <p className='text-gray-500 text-sm'>
            Listado de usuarios registrados
          </p>
        </div>
        {/* Botón para crear usuario (comentado por ahora) */}

        <button
          className='bg-main-blue px-4 py-2 rounded text-white hover:opacity-90 transition'
          onClick={() => setOpenCreateModal(true)}
        >
          + Agregar Usuario
        </button>
      </div>
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder='Buscar por nombre o username...'
            className='md:col-span-2 w-full px-3 py-2 border rounded-lg'
          />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className='w-full px-3 py-2 border rounded-lg'
          >
            <option value='ALL'>Todos los roles</option>
            <option value='ADMIN_ROLE'>ADMIN_ROLE</option>
            <option value='USER_ROLE'>USER_ROLE</option>
          </select>
        </div>
      </div>
      <div className='bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead className='bg-gray-50 text-gray-700'>
              <tr>
                <th className='text-left px-4 py-3'>Nombre</th>
                <th className='text-left px-4 py-3'>Username</th>
                <th className='text-left px-4 py-3'>Rol</th>
              <th className='text-right px-4 py-3'>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td
                    className='px-4 py-6 text-center text-gray-500'
                    // colSpan={4}
                    colSpan={3}
                  >
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
                    <td className='px-4 py-3'>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          u.role === 'ADMIN_ROLE'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-right space-x-2'>
                      <button
                        onClick={() => handleOpenDetail(u)}
                        className='px-3 py-1.5 rounded-lg bg-main-blue text-white text-xs font-semibold hover:opacity-90'
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold hover:opacity-90 ${
                          u.status ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
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
        <div className='flex items-center justify-between px-4 py-3 border-t bg-gray-50'>
          <p className='text-xs text-gray-600'>
            Mostrando{' '}
            {(currentPage - 1) * PAGE_SIZE + (paginatedUsers.length ? 1 : 0)}
            {' - '}
            {(currentPage - 1) * PAGE_SIZE + paginatedUsers.length} de{' '}
            {filteredUsers.length}
          </p>
          <div className='flex gap-2'>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
            >
              Anterior
            </button>
            <span className='px-2 py-1.5 text-sm text-gray-700'>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className='px-3 py-1.5 rounded border bg-white text-sm disabled:opacity-50'
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
