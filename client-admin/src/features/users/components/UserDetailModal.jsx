import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

export const UserDetailModal = ({ isOpen, onClose, user, onSave, loading }) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      phone: '',
      role: 'USER_ROLE',
    },
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (!user) return;
    reset({
      name: user.name || '',
      surname: user.surname || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'USER_ROLE',
    });
  }, [user, reset]);

  if (!isOpen || !user) return null;

  const submit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('surname', values.surname);
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('phone', values.phone);
    formData.append('role', values.role);

    if (values.password) {
      formData.append('password', values.password);
    }

    if (values.profilePicture?.[0]) {
      formData.append('profilePicture', values.profilePicture[0]);
    }

    const ok = await onSave(user.id, formData);
    if (ok) {
      reset();
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 px-3 sm:px-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden'>
        <div
          className='p-4 sm:p-5 text-white sticky top-0 z-10'
          style={{
            background:
              'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
          }}
        >
          <h2 className='text-xl sm:text-2xl font-bold'>Editar Usuario</h2>
          <p className='text-xs sm:text-sm opacity-80'>
            Actualiza los datos del usuario seleccionado.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className='p-4 sm:p-6 space-y-4 overflow-y-auto'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Nombre
              </label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.name && (
                <p className='text-red-600 text-xs'>{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Apellido
              </label>
              <input
                {...register('surname', {
                  required: 'El apellido es obligatorio',
                })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.surname && (
                <p className='text-red-600 text-xs'>{errors.surname.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Nombre de Usuario
              </label>
              <input
                {...register('username', {
                  required: 'El nombre de usuario es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'Debe tener al menos 3 caracteres',
                  },
                })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.username && (
                <p className='text-red-600 text-xs'>
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Teléfono
              </label>
              <input
                {...register('phone', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[0-9]{8}$/,
                    message: 'Debe ser un número de 8 dígitos',
                  },
                })}
                type='tel'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.phone && (
                <p className='text-red-600 text-xs'>{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Email
            </label>
            <input
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Formato de email inválido',
                },
              })}
              type='email'
              className='w-full px-3 py-2 border rounded-lg'
            />
            {errors.email && (
              <p className='text-red-600 text-xs'>{errors.email.message}</p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Contraseña nueva
              </label>
              <input
                {...register('password', {
                  minLength: {
                    value: 8,
                    message: 'Debe tener al menos 8 caracteres',
                  },
                })}
                type='password'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.password && (
                <p className='text-red-600 text-xs'>{errors.password.message}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Confirmar contraseña
              </label>
              <input
                {...register('confirmPassword', {
                  validate: (value) =>
                    !passwordValue ||
                    value === passwordValue ||
                    'Las contraseñas no coinciden',
                })}
                type='password'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.confirmPassword && (
                <p className='text-red-600 text-xs'>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Rol
              </label>
              <select
                {...register('role', { required: true })}
                className='w-full px-3 py-2 border rounded-lg'
              >
                <option value='USER_ROLE'>USER_ROLE</option>
                <option value='ADMIN_ROLE'>ADMIN_ROLE</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Foto de Perfil
              </label>
              <input
                {...register('profilePicture')}
                type='file'
                accept='image/*'
                className='w-full px-3 py-2 border rounded-lg'
              />
            </div>
          </div>

          <div className='flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-5 py-2 rounded-lg text-white font-medium transition shadow disabled:opacity-60'
              style={{
                background:
                  'linear-gradient(90deg, var(--main-blue) 0%, #1956a3 100%)',
                border: 'none',
              }}
            >
              {loading ? <Spinner small /> : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
