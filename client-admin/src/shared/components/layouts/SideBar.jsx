import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const items = [
    {
      label: 'Usuarios',
      to: '/dashboard/users',
      icon: (
        <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M17 20h5V4H2v16h5m10 0v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2m12 0H7m10-10a4 4 0 11-8 0 4 4 0 018 0z'
          />
        </svg>
      ),
    },
  ];
  
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className='md:hidden fixed top-5 left-4 z-[60] p-2 rounded-xl bg-[#0A1F44] text-white shadow-lg'
      >
        ☰
      </button>

      {open && (
        <div
          className='fixed inset-0 bg-black/40 z-40 md:hidden'
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-50
          h-screen w-64
          bg-[#0A1F44]/95 backdrop-blur-xl
          border-r border-white/10
          flex flex-col
          transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className='h-20 flex items-center px-6 border-b border-white/10'>
          <div>
            <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
              {user?.role === 'BANK_ADMIN'
                ? 'Panel administrativo'
                : 'Panel de usuario'}
            </p>

            <h2 className='text-white font-bold text-lg'>
              CrediExpress
            </h2>
          </div>
        </div>

        <div className='px-4 py-6 border-b border-white/10'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-full bg-gradient-to-br from-[#E11D48] to-[#FF1744] flex items-center justify-center text-white font-bold'>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <p className='text-white font-medium text-sm'>
                {user?.username || 'Sin usuario'}
              </p>

              <p className='text-slate-400 text-xs'>
                {user?.role || 'Sin rol'}
              </p>
            </div>
          </div>
        </div>

        <nav className='flex-1 p-4 overflow-y-auto'>
          <ul className='space-y-2'>
            {items.map((item) => {
              const active = location.pathname === item.to;

              return (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-2xl
                      transition
                      ${active
                        ? 'bg-[#123B7A] text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className='mt-auto px-3 pb-4 pt-4 border-t border-white/10'>
          <button
            onClick={onLogout}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 hover:bg-[#c81b42] text-white font-medium transition'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 16l4-4m0 0l-4-4m4 4H7'
              />
            </svg>

            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};