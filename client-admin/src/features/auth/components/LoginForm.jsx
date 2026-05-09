import { useForm } from "react-hook-form"
import { useAuthStore } from "../store/authStore.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const LoginForm = ({ onForgot }) => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const loading = useAuthStore((state) => state.loading);
    const error = useAuthStore((state) => state.error);
    
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        const res = await login(data);
        if (res.success) {
            navigate("/dashboard");
            toast.success("Inicio de sesión exitoso", { duration: 3000 });
        } else if (res.error) {
            toast.error(res.error, { duration: 4000 });
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
                <label
                    htmlFor="emailOrUsername"
                    className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                   Usuario o correo
                </label>
                <input
                    type="text"
                    id="emailOrUsername"
                    placeholder="Correo electrónico o usuario"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    {
                    ...register("emailOrUsername", {
                        required: "Este campo es obligatorio",
                    })
                    }
                />
                {errors.emailOrUsername && (
                    <p className="text-red-600 text-xs mt-1">
                        {errors.emailOrUsername.message}
                    </p>
                )}
            </div>
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-800 mb-1.5"
                >
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    placeholder="° ° ° ° ° ° ° °"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    {
                    ...register("password", {
                        required: "Este campo es obligatorio",
                    })
                    }
                />
                {errors.password && (
                    <p className="text-red-600 text-xs mt-1">
                        {errors.password.message}
                    </p>
                )}
            </div>
                {error && <p className="text-red-600 text-xs mt-1 text-center">{error}</p>}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm"
            >
                {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
            <p className='text-center text-sm'>
                <button
                    type='button'
                    onClick={onForgot}
                    className='text-main-blue hover:underline hover:cursor-pointer'
                >
                    ¿Olvidaste tu contraseña?
                </button>
            </p>
        </form>



    )
}

