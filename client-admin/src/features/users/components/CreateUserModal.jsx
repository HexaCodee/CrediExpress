import { useForm } from 'react-hook-form';
import { Spinner } from '../../auth/components/Spinner.jsx';

export const CreateUserModal = ({
  isOpen,
  onClose,
  onCreate,
  loading,
  error,
}) => {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  const submit = async (values) => {
    const formData = new FormData();
    formData.append('name', values.name);
    formData.append('surname', values.surname);
    formData.append('username', values.username);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('phone', values.phone);
    formData.append('dpi', values.dpi);
    formData.append('address', values.address);
    formData.append('jobName', values.jobName);
    formData.append('monthlyIncome', values.monthlyIncome);
    if (values.profilePicture?.[0]) {
      formData.append('profilePicture', values.profilePicture[0]);
    }

    const ok = await onCreate(formData);
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
          <h2 className='text-xl sm:text-2xl font-bold'>Nuevo Usuario</h2>
          <p className='text-xs sm:text-sm opacity-80'>
            Completa la información para registrar un nuevo usuario
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
                Nickname / Username
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

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                DPI
              </label>
              <input
                {...register('dpi', {
                  required: 'El DPI es obligatorio',
                  pattern: {
                    value: /^[0-9]{13}$/,
                    message: 'El DPI debe tener 13 dígitos',
                  },
                })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.dpi && (
                <p className='text-red-600 text-xs'>{errors.dpi.message}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Dirección
              </label>
              <input
                {...register('address', {
                  required: 'La dirección es obligatoria',
                  maxLength: {
                    value: 200,
                    message: 'La dirección no puede tener más de 200 caracteres',
                  },
                })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.address && (
                <p className='text-red-600 text-xs'>{errors.address.message}</p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Nombre de trabajo
              </label>
              <input
                {...register('jobName', {
                  required: 'El nombre de trabajo es obligatorio',
                  maxLength: {
                    value: 100,
                    message: 'El nombre de trabajo no puede tener más de 100 caracteres',
                  },
                })}
                type='text'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.jobName && (
                <p className='text-red-600 text-xs'>{errors.jobName.message}</p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Ingresos mensuales (Q)
              </label>
              <input
                {...register('monthlyIncome', {
                  required: 'Los ingresos mensuales son obligatorios',
                  min: {
                    value: 100,
                    message: 'Los ingresos deben ser al menos Q100',
                  },
                })}
                type='number'
                step='0.01'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.monthlyIncome && (
                <p className='text-red-600 text-xs'>
                  {errors.monthlyIncome.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              El número de cuenta se genera automáticamente al crear el cliente.
            </p>
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
                Contraseña
              </label>
              <input
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: {
                    value: 8,
                    message: 'Debe tener al menos 8 caracteres',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
                    message: 'Debe incluir mayúscula, minúscula, número y carácter especial',
                  },
                })}
                type='password'
                className='w-full px-3 py-2 border rounded-lg'
              />
              {errors.password && (
                <p className='text-red-600 text-xs'>
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Confirmar contraseña
              </label>
              <input
                {...register('confirmPassword', {
                  required: 'Debe confirmar su contraseña',
                  validate: {
                    matchesPassword: (value) =>
                      value === getValues('password') ||
                      'Las contraseñas no coinciden',
                  },
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

          {error && <p className='text-red-600 text-sm text-center'>{error}</p>}

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
              {loading ? <Spinner small /> : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
