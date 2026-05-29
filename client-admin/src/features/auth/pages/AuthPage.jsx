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
        <main>
            <section
                className='min-h-screen flex items-center justify-end bg-cover bg-center bg-no-repeat relative overflow-hidden p-4'
                style={{
                    backgroundImage: `linear-gradient(rgba(2 , 6, 23, 0.88),rgba(2, 6, 23, 0.92)), url('/src/assets/img/FondoAuth.avif')`
                }}
            >

                <div className='absolute top-0 left-[-1090px] w-500 h-50 bg-[#0A1F44] rotate-[-35deg] z-10'></div>
                <div className="absolute top-0 left-[-165px] w-200 h-3 bg-red-900 rotate-[-35deg] z-10"></div>
                <div className="absolute top-6 left-[-180px] w-200 h-[2px] bg-red-900 shadow-[0_0_25px_red,0_0_25px_red,0_0_30px_red,0_0_60px_red] rotate-[-35deg] z-10 opacity-70"></div>
                <div className="absolute top-6 left-[-205px] w-200 h-[2px] bg-red-900 shadow-[0_0_25px_red,0_0_25px_red,0_0_30px_red,0_0_60px_red] rotate-[-35deg] z-10 opacity-70"></div>

                <div className="absolute top-200 right-[-220px] w-200 h-40 bg-[#0A1F44] rotate-[-35deg] z-10"></div>
                <div className="absolute top-200 right-[-175px] w-200 h-3 bg-red-900 rotate-[-35deg] z-10"></div>
                <div className="absolute top-200 right-[-170px] w-200 h-[2px] bg-red-900 shadow-[0_0_25px_red,0_0_25px_red,0_0_30px_red,0_0_60px_red] rotate-[-35deg] z-10 opacity-70"></div>
                <div className="absolute top-200 right-[-194px] w-200 h-[2px] bg-red-900 shadow-[0_0_25px_red,0_0_25px_red,0_0_30px_red,0_0_60px_red] rotate-[-35deg] z-10 opacity-70"></div>

                <aside className='absolute top-50 left-50 z-50 flex flex-col items-start gap-6'>

                    <header>
                        <div className='flex items-center gap-3 rounded-full'>
                            <figure>
                                <img
                                    src="/src/assets/img/CrediExpressLogo.png"
                                    alt="CrediExpress logo"
                                    className='h-25 w-auto'
                                />
                            </figure>

                            <div className='text-white leading-tight'>
                                <h1 className='text-3xl sm:text-4xl font-semibold tracking-wide'>
                                    <span className='text-white font-bold tracking-wide drop-shadow-[0_0_10px_rgba(37,99,235,0.8)]'>Credi</span>
                                    <span className='text-red-500 font-bold tracking-wide drop-shadow-[0_0_10px_rgba(255,0,0,0.9)]'>Express</span>
                                </h1>

                                <p className='text-md text-slate-300'>
                                    Tu crédito, nuestro compromiso
                                </p>
                            </div>
                        </div>
                    </header>

                    <section className='max-w-md text-white text-sm leading-relaxed'>
                        <p className='mb-6'>
                            Accede a tu cuenta y continúa gestionando tus créditos
                            de manera <strong>rápida, segura y confiable.</strong>
                        </p>

                        <div className='flex items-start gap-8'>

                            <article className='flex flex-col items-center gap-3 max-w-[120px]'>
                                <figure className='p-3 rounded-full'>
                                    <img
                                        src="/src/assets/img/Seguro.png"
                                        alt="Seguridad"
                                        className='h-25 w-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]'
                                    />
                                </figure>

                                <div className='text-center'>
                                    <h2 className='text-xs font-semibold text-white'>
                                        SEGURO
                                    </h2>

                                    <p className='text-[12px] text-slate-300'>
                                        Protegemos tu información
                                    </p>
                                </div>
                            </article>

                            <article className='flex flex-col items-center gap-3 max-w-[120px]'>
                                <figure className='p-3 rounded-full'>
                                    <img
                                        src="/src/assets/img/Rapido.png"
                                        alt="Rapidez"
                                        className='h-25 w-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]'
                                    />
                                </figure>

                                <div className='text-center'>
                                    <h2 className='text-xs font-semibold text-white'>
                                        RÁPIDO
                                    </h2>

                                    <p className='text-[12px] text-slate-300'>
                                        Accede en segundos a tu cuenta
                                    </p>
                                </div>
                            </article>
                            <article className='flex flex-col items-center gap-3 max-w-[120px]'>
                                <figure className='p-3 rounded-full'>
                                    <img
                                        src="/src/assets/img/Confiable.png"
                                        alt="Confiable"
                                        className='h-25 w-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]'
                                    />
                                </figure>

                                <div className='text-center'>
                                    <h2 className='text-xs font-semibold text-white'>
                                        CONFIABLE
                                    </h2>
                                    <p className='text-[12px] text-slate-300'>
                                        Confianza que te respalda
                                    </p>
                                </div>
                            </article>
                        </div>
                    </section>
                </aside>

                <section className='absolute right-40 top-1/2 -translate-y-1/2 z-20 w-full min-h-[600px] max-w-md sm:max-w-xl backdrop-blur-md bg-slate-950/40 rounded-[30px] border-2 border-red-600 p-6 sm:p-8'>
                    <header className='text-center mb-8'>
                        <figure>
                            <img
                                src="/src/assets/img/IconoLogin.png"
                                alt="CrediExpress login icon"
                                className='h-10 w-auto mx-auto mb-4'
                            />
                        </figure>
                        <h2 className='text-3xl sm:text-4xl font-bold text-white mb-3'>
                            {isForgot
                                ? 'Recuperar contraseña'
                                : '¡Bienvenido de nuevo!'
                            }
                        </h2>
                        <p className='text-white text-sm sm:text-base max-w-lg mx-auto leading-relaxed'>
                            {isForgot
                                ? 'Ingresa tu correo electrónico para recibir instrucciones de recuperación de contraseña.'
                                : 'Ingresa tus credenciales para acceder a tu cuenta.'
                            }
                        </p>
                    </header>
                    <section className='space-y-6'>
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

                    </section>
                    <footer className='mt-6 rounded-3xl text-center text-sm text-slate-400'>
                        <p className='font-semibold text-slate-300'>
                            ¿Problemas para iniciar sesión?
                        </p>
                        <p className='mt-2 leading-relaxed'>
                           Nuestro equipo de soporte está disponible para ayudarte.
                        </p>
                        <address className='mt-3 font-semibold text-red-600 not-italic'>
                            +502 1234-5678
                        </address>
                    </footer>
                </section>
            </section>
        </main>
    )
}