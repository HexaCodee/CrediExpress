import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { updateUser, getUserById } from '../../../shared/apis/user.js';
import { normalizeUserModel } from '../../../shared/utils/user.js';
import defaultAvatarImg from '../../../assets/img/UserDefault.png';

export const ProfilePage = () => {
  const rawAuthUser = useAuthStore((s) => s.user);
  const authUser = useMemo(() => normalizeUserModel(rawAuthUser) || rawAuthUser, [rawAuthUser]);
  const setAuthUser = useAuthStore.setState;

  const isRemoteDefaultAvatar = (url) =>
    typeof url === 'string' && url.includes('avatarDefault-1749508519496.png');

  const [form, setForm] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    jobName: '',
    monthlyIncome: '',
    profilePicture: null,
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [loadingAdminUser, setLoadingAdminUser] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  

  useEffect(() => {
    if (authUser) {
      setForm({
        name: authUser.name || authUser.Name || '',
        surname: authUser.surname || authUser.Surname || '',
        username: authUser.username || authUser.Username || '',
        email: authUser.email || authUser.Email || '',
        phone: authUser.phone || authUser.Phone || '',
        address: authUser.address || authUser.Address || '',
        jobName: authUser.jobName || authUser.JobName || '',
        monthlyIncome: authUser.monthlyIncome || authUser.MonthlyIncome || '',
        profilePicture: null,
      });
      const initialPicture =
        authUser.profilePicture?.trim()
          ? authUser.profilePicture
          : authUser.ProfilePicture?.trim() && !isRemoteDefaultAvatar(authUser.ProfilePicture)
          ? authUser.ProfilePicture
          : defaultAvatarImg;
      setPreview(initialPicture);
    }
  }, [authUser]);

  useEffect(() => {
    const loadAdminUser = async () => {
      const uid = authUser?.id || authUser?.Id;
      if (!uid) return;
      setLoadingAdminUser(true);
      try {
        const resp = await getUserById(uid);
        const u = resp?.user || resp;
        setAdminUser(u || null);
      } catch (err) {
        setAdminUser(null);
      } finally {
        setLoadingAdminUser(false);
      }
    };
    loadAdminUser();
  }, [authUser]);

  

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    // Prevent users from modifying profilePicture directly
    if (name === 'profilePicture') return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('surname', form.surname);
      fd.append('username', form.username);
      fd.append('email', form.email);
      if (form.phone) fd.append('phone', form.phone);
      if (form.profilePicture) fd.append('profilePicture', form.profilePicture);

      const userId = authUser.id || authUser.Id;
      const res = await updateUser(userId, fd);
      setAuthUser({ user: res, isAuthenticated: true });
      setPreview(res.profilePicture || res.ProfilePicture || preview || '');
      setMessage('Perfil actualizado correctamente');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!authUser) return <p className='text-slate-200'>Cargando tu perfil...</p>;

  return (
    <section className='space-y-6'>
      <header className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-semibold text-white'>Mi perfil</h1>
            <p className='mt-2 text-sm text-slate-300'>Revisa y actualiza tu información personal. La contraseña no se edita aquí.</p>
          </div>
          <div className='flex items-center gap-4'>
            <div className='h-24 w-24 rounded-full overflow-hidden border border-slate-600 bg-slate-800'>
              <img
                src={
                  preview ||
                  authUser.profilePicture ||
                  (authUser.ProfilePicture && !isRemoteDefaultAvatar(authUser.ProfilePicture) ? authUser.ProfilePicture : defaultAvatarImg)
                }
                alt={authUser.username || authUser.Username || 'Perfil'}
                className='h-full w-full object-cover'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatarImg;
                }}
              />
            </div>
            <div className='space-y-1'>
              <p className='text-xl font-semibold text-white'>{[authUser.name || authUser.Name, authUser.surname || authUser.Surname].filter(Boolean).join(' ') || authUser.username || authUser.Username}</p>
              <p className='text-sm text-slate-400'>{authUser.email || authUser.Email || 'Sin correo registrado'}</p>
              <p className='text-sm text-slate-400'>Rol: {authUser.role || authUser.Role || 'Usuario'}</p>
            </div>
          </div>
          <div>
            <button
              type='button'
              onClick={() => setShowEdit(true)}
              className='rounded-2xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white'
            >
              Editar perfil
            </button>
          </div>
        </div>
      </header>

      <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white mb-4'>Información visible</h2>
          <div className='grid gap-3'>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Usuario</span>
              <span>{(adminUser && (adminUser.username || adminUser.Username)) || authUser.username || '-'}</span>
            </div>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Nombre completo</span>
              <span>{(adminUser && [adminUser.name, adminUser.surname].filter(Boolean).join(' ')) || [authUser.name, authUser.surname].filter(Boolean).join(' ') || '-'}</span>
            </div>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Correo</span>
              <span>{(adminUser && (adminUser.email || adminUser.Email)) || authUser.email || '-'}</span>
            </div>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Teléfono</span>
              <span>{(adminUser && (adminUser.phone || adminUser.Phone)) || authUser.phone || '-'}</span>
            </div>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Dirección</span>
              <span>{(adminUser && (adminUser.address || adminUser.Address)) || authUser.address || '-'}</span>
            </div>
            <div className='grid grid-cols-[160px_1fr] gap-3 text-sm text-slate-300'>
              <span className='font-semibold text-slate-400'>Ingreso mensual</span>
              <span>{(adminUser && (adminUser.monthlyIncome || adminUser.MonthlyIncome)) ? `$${adminUser.monthlyIncome || adminUser.MonthlyIncome}` : (authUser.monthlyIncome ? `$${authUser.monthlyIncome}` : '-')}</span>
            </div>
            
          </div>
        </div>

        {showEdit && (
          <form onSubmit={handleSubmit} className='rounded-3xl bg-slate-900/80 p-6 shadow-xl border border-slate-700'>
          <h2 className='text-xl font-semibold text-white mb-4'>Editar datos autorizados</h2>
          <div className='grid gap-4'>
            <label className='space-y-2 text-sm text-slate-300'>
              Nombre
              <input name='name' value={form.name} onChange={handleChange} className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white' />
            </label>
            <label className='space-y-2 text-sm text-slate-300'>
              Apellido
              <input name='surname' value={form.surname} onChange={handleChange} className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white' />
            </label>
            <label className='space-y-2 text-sm text-slate-300'>
              Usuario
              <input name='username' value={form.username} onChange={handleChange} className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white' />
            </label>
            <label className='space-y-2 text-sm text-slate-300'>
              Correo electrónico
              <input name='email' value={form.email} onChange={handleChange} type='email' className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white' />
            </label>
            <label className='space-y-2 text-sm text-slate-300'>
              Teléfono
              <input name='phone' value={form.phone} onChange={handleChange} className='w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white' />
            </label>
            {/* Users cannot change profile picture here; controlled by admins */}
          </div>

          {message && <div className='rounded-2xl border border-slate-600 bg-slate-800/60 px-4 py-3 text-sm text-slate-200'>{message}</div>}

          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <button disabled={loading} className='inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white'>Guardar cambios</button>
            <button type='button' onClick={() => setMessage('Para seguridad, la contraseña se cambia en la sección de seguridad.') } className='inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white'>Cambiar contraseña</button>
            <button type='button' onClick={() => setShowEdit(false)} className='inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-white'>Cerrar</button>
          </div>
          </form>
        )}
      </div>
      
    </section>
  );
};
