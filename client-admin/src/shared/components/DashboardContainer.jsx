import { useState } from "react";
import fondoDashboard from "../../assets/img/FondoDashboard.png";
import logo from "../../assets/img/CrediExpress.png";

export const DashboardContainer = ({ user, onLogout, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="h-screen w-full bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${fondoDashboard})` }}
    >
      <header className="fixed top-0 left-0 right-0 z-10 bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-200">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <img src={logo} alt="CrediExpress logo" className="h-12 w-auto rounded-full border border-gray-200" />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-[0.18em]">Panel administrativo</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Bienvenido {user?.name || 'Usuario'}</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-white bg-[#E11D48] hover:bg-[#c31b44] rounded-full font-medium transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-20">
        <aside className={`${sidebarOpen ? 'block' : 'hidden'} md:block fixed left-0 top-20 bottom-0 w-[200px] bg-[#0A1F44] shadow-sm z-10`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
                            <li>
                <a href="/dashboard/users" className="block px-4 py-2 text-md text-white hover:bg-[#0A1F44]/80 rounded-md transition">
                  Usuarios
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <main className="flex-1 md:ml-[200px] p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
