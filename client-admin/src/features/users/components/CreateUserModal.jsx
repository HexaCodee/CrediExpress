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
      <div className='bg-slate-950/90 border border-slate-700 rounded-[32px] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden'>
        <div className='bg-[#0A1F44] px-6 py-5 text-white sticky top-0 z-10'>
          <h2 className='text-2xl font-semibold'>Nuevo Usuario</h2>
          <p className='text-sm text-slate-200 mt-1'>Completa la información para registrar un nuevo usuario</p>
        </div>

        <form
          onSubmit={handleSubmit(submit)}
          className='px-6 py-6 grid gap-4 lg:grid-cols-2 overflow-y-auto'
        >
          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Nombre</label>
            <input
              {...register('name', { required: 'El nombre es obligatorio' })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Nombre'
            />
            {errors.name && <p className='text-sm text-rose-300'>{errors.name.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Apellido</label>
            <input
              {...register('surname', { required: 'El apellido es obligatorio' })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Apellido'
            />
            {errors.surname && <p className='text-sm text-rose-300'>{errors.surname.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Nickname / Username</label>
            <input
              {...register('username', {
                required: 'El nombre de usuario es obligatorio',
                minLength: {
                  value: 3,
                  message: 'Debe tener al menos 3 caracteres',
                },
              })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Username'
            />
            {errors.username && <p className='text-sm text-rose-300'>{errors.username.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Teléfono</label>
            <input
              {...register('phone', {
                required: 'El teléfono es obligatorio',
                pattern: {
                  value: /^[0-9]{8}$/,
                  message: 'Debe ser un número de 8 dígitos',
                },
              })}
              type='tel'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Teléfono'
            />
            {errors.phone && <p className='text-sm text-rose-300'>{errors.phone.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>DPI</label>
            <input
              {...register('dpi', {
                required: 'El DPI es obligatorio',
                pattern: {
                  value: /^[0-9]{13}$/,
                  message: 'El DPI debe tener 13 dígitos',
                },
              })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='DPI'
            />
            {errors.dpi && <p className='text-sm text-rose-300'>{errors.dpi.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Dirección</label>
            <input
              {...register('address', {
                required: 'La dirección es obligatoria',
                maxLength: {
                  value: 200,
                  message: 'La dirección no puede tener más de 200 caracteres',
                },
              })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Dirección'
            />
            {errors.address && <p className='text-sm text-rose-300'>{errors.address.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Nombre de trabajo</label>
            <input
              {...register('jobName', {
                required: 'El nombre de trabajo es obligatorio',
                maxLength: {
                  value: 100,
                  message: 'El nombre de trabajo no puede tener más de 100 caracteres',
                },
              })}
              type='text'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Nombre de trabajo'
            />
            {errors.jobName && <p className='text-sm text-rose-300'>{errors.jobName.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Ingresos mensuales (Q)</label>
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
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Ingresos mensuales'
            />
            {errors.monthlyIncome && <p className='text-sm text-rose-300'>{errors.monthlyIncome.message}</p>}
          </div>

          <div className='lg:col-span-2'>
            <p className='text-sm text-slate-400'>El número de cuenta se genera automáticamente al crear el cliente.</p>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Email</label>
            <input
              {...register('email', {
                required: 'El email es obligatorio',
                pattern: {
                  value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                  message: 'Formato de email inválido',
                },
              })}
              type='email'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Email'
            />
            {errors.email && <p className='text-sm text-rose-300'>{errors.email.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Contraseña</label>
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
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Contraseña'
            />
            {errors.password && <p className='text-sm text-rose-300'>{errors.password.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Confirmar contraseña</label>
            <input
              {...register('confirmPassword', {
                required: 'Debe confirmar su contraseña',
                validate: {
                  matchesPassword: (value) =>
                    value === getValues('password') || 'Las contraseñas no coinciden',
                },
              })}
              type='password'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
              placeholder='Confirmar contraseña'
            />
            {errors.confirmPassword && <p className='text-sm text-rose-300'>{errors.confirmPassword.message}</p>}
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Foto de Perfil</label>
            <input
              {...register('profilePicture')}
              type='file'
              accept='image/*'
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-slate-400'
            />
          </div>

          <div className='grid gap-2'>
            <label className='text-sm text-slate-300'>Rol</label>
            <select
              {...register('role')}
              className='w-full px-4 py-3 bg-slate-950/70 border border-slate-700 rounded-2xl text-white outline-none focus:border-slate-400'
            >
              <option value='USER_ROLE'>USER_ROLE</option>
              <option value='ADMIN_ROLE'>ADMIN_ROLE</option>
            </select>
          </div>

          {error && <p className='text-red-600 text-sm text-center lg:col-span-2'>{error}</p>}

          <div className='lg:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-slate-700'>
            <button
              type='button'
              onClick={onClose}
              className='w-full sm:w-auto px-4 py-2 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='w-full sm:w-auto px-5 py-3 rounded-2xl text-white font-semibold transition shadow disabled:opacity-60 bg-[#0A1F44] hover:bg-[#082236]'
            >
              {loading ? <Spinner small /> : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
