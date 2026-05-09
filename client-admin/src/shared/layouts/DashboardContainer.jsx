import { useState } from "react";

export const DashboardContainer = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">CrediExpress Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Bienvenido, {user?.name || 'Usuario'}</span>
              <button
                onClick={onLogout}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-sm min-h-screen`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  Usuarios
                </a>
              </li>
              <li>
                <a href="/dashboard/loans" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                  Préstamos
                </a>
              </li>
              {/* Agrega más enlaces según necesites */}
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
