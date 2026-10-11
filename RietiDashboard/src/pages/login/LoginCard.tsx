import { useForm, type SubmitHandler } from 'react-hook-form';
import { Eye, EyeClosed } from 'lucide-react'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { ApiError } from '@/lib/api/client';

/** Fields of the login form */
interface LoginInputs {
  email: string;
  password: string;
}

/** Sign-in form: validates the fields, logs in with the API and goes home, or shows the error */
export const LoginCard = () => {
  const { login } = useAuth();
  const go = useNavigate();

  // // const [passwordChange, setPasswordChange] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInputs>({
    defaultValues: { email: '', password: '' },
  });

  const [showPassword, setShowPassword] = useState<boolean>(false)

  // log in and go home
  const onSubmit: SubmitHandler<LoginInputs> = async ({ email, password }) => {
    try {
      await login(email, password)
      go('/home')
    } catch (err) {
      setError('root', { message: err instanceof ApiError ? err.message : 'No se pudo iniciar sesión' })
    }
  }

return (
  <div className="flex-col rounded-2xl p-5 bg-card m-5 block w-auto shadow-2xl h-fit md:w-md justify-self-center">
    <h1>Iniciar sesión</h1>
    <p className="font-sight">Ingresa tus credenciales para acceder al sistema</p>

    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="my-2">
        <div className="flex justify-between items-center">
          <label htmlFor="email" className='text-clear'>Email</label>
          <span className="input-tag">Obligatorio</span>
        </div>
        <input
          id="email"
          type="email"
          placeholder="ejemplo@mail.com"
          className='input-field px-2 font-medium'
          {...register('email', {
            required: 'El email es obligatorio',
            pattern: { value: /\S+@\S+\.\S+/, message: 'Formato de correo inválido' },
          })}
        />
        {errors.email && (
          <span className="text-red-500 text-xs">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="my-2">
        <div className="flex flex-row justify-between">
          <label htmlFor="password" className='text-clear'>Contraseña</label>
          <span className="input-tag">Obligatorio</span>
        </div>
        <div className='relative'>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tu contraseña"
            className='input-field px-2 font-medium'
            {...register('password', { required: 'La contraseña es obligatoria' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-red-500 text-xs">
            {errors.password.message}
          </span>
        )}
      </div>

      {errors.root && (
        <span className="text-red-500 text-xs">{errors.root.message}</span>
      )}

      <button
        type="submit"
        className="cursor-pointer p-1 bg-[#2563eb] text-white border-white rounded-lg text-lg w-full my-2 hover:bg-[#1d4ed8] justify-self-center"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Cargando...' : 'Continuar'}
      </button>
    </form>
  </div>
);
};