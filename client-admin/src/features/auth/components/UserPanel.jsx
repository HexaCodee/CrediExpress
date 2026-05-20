import { useAuthStore } from "../store/authStore.js";

export const UserPanel = () => {
    const user = useAuthStore((s) => s.user);

    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Panel de usuario</h1>
            <p className="text-sm text-gray-600">Bienvenido, {user?.name || user?.username || 'Usuario'}</p>
            <div className="mt-6">
                <p className="text-gray-700">Aquí irá la vista principal del usuario.</p>
            </div>
        </div>
    );
};
