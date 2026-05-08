import { useState, useEffect } from 'react'
import { LoginForm } from "../components/LoginForm.jsx"
import { ForgotPassword } from "../components/ForgotPassword.jsx"

export const AuthPage = () => {
    const [isForgot, setIsForgot] = useState(false);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = originalOverflow
        }
    }, [])
    

    return (
        <div className='min-h-screen flex items-center justify-center bg-cover bg-center p-4' style={{ backgroundImage: "url('/src/assets/img/Fondo1.png')" }}>
            <div className='w-full max-w-md sm:max-w-xl bg-white/95 backdrop-blur-xl rounded-[30px] shadow-2xl border border-gray-200/80 p-6 sm:p-8'>
                <div className='flex justify-center mb-6'>
                    <img 
                        src="/src/assets/img/CrediExpress.png" 
                        alt="CrediExpress logo"
                        className='h-20 w-auto'
                    />
                </div>

                <div className='text-center mb-8'>
                    <h1 className='text-3xl sm:text-4xl font-semibold text-slate-900 mb-3'>
                        {isForgot ? 'Recuperar contraseña' : 'Bienvenido de nuevo'}
                    </h1>
                    <p className='text-slate-600 text-sm sm:text-base max-w-lg mx-auto'>
                        {isForgot
                            ? 'Ingresa tu correo electrónico para recibir instrucciones de recuperación de contraseña.'
                            : 'Ingresa tus credenciales para acceder a tu cuenta.'
                        }
                    </p>
                </div>

                <div className='space-y-6'>
                    {isForgot ? (
                        <ForgotPassword
                            onSwitch={() => {
                                setIsForgot(false);
                            }}
                        />
                    ) : (
                        <LoginForm
                            onForgot={() => {
                                setIsForgot(true);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}



