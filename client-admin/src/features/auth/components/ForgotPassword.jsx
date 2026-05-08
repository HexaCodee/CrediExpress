import { use } from "react";
import { useForm } from "react-hook-form";

export const ForgotPassword = ({ onSwitch }) => {
    const {
        register,
        //    handleSubmit,
        formState: { errors },
    } = useForm();

    return (
        <form className="space-y-5">
            <div>
                <input
                    type="email"
                    id="email"
                    placeholder="  forgotpassword@gmail.com"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    {
                    ...register("email", {
                        required: "Este campo es obligatorio",
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: "Ingrese un correo electrónico válido",
                        }
                    })
                    }
                />
                {errors.email && (
                    <p className="text-red-600 text-xs mt-1">
                        {errors.email.message}
                    </p>
                )}
            </div>
            <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
                Enviar instrucciones
            </button>
            <p className='text-center text-sm'>
                <button
                    type='button'
                    onClick={onSwitch}
                    className='text-main-blue hover:underline hover:cursor-pointer'
                >
                     Regresar
                </button>
            </p>
        </form>

    )
}
