import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

import HomeIcon from '../../../assets/img/Home.png';
import TransactionIcon from '../../../assets/img/Transaction.png';
import UserIcon from '../../../assets/img/User.png';
import ChangeIcon from '../../../assets/img/Change.png';
import AccountIcon from '../../../assets/img/Account.png';
import LogoutIcon from '../../../assets/img/Logout.png';
import CrediExpressLogo from '../../../assets/img/crediExpressLogo.png';

export const Sidebar = ({ user, onLogout }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const isAdmin =
    user?.role?.toUpperCase() === 'BANK_ADMIN';

  const adminItems = [
    {
      label: 'Usuarios',
      to: '/dashboard/users',
      icon: (
        <img
          src={UserIcon}
          alt='Perfil'
          className='w-5 h-5'
        />
      ),
    },
    {
      label: 'Cuentas',
      to: '/dashboard/bank-accounts',
      icon: (
        <img
          src={AccountIcon}
          alt='Cuentas'
          className='w-5 h-5'
        />
      ),
    },
  ];

  const userItems = [
    {
      label: 'Inicio',
      to: '/dashboard/home',
      icon: (
        <img
          src={HomeIcon}
          alt='Inicio'
          className='w-5 h-5'
        />
      ),
    },
    {
      label: 'Perfil',
      to: '/dashboard/profile',
      icon: (
        <img
          src={UserIcon}
          alt='Perfil'
          className='w-5 h-5'
        />
      ),
    },
    {
      label: 'Transacciones',
      to: '/dashboard/loans',
      icon: (
        <img
          src={TransactionIcon}
          alt='Transacciones'
          className='w-5 h-5'
        />
      ),
    },
    {
      label: 'Conversión',
      to: '/dashboard/conversion',
      icon: (
        <img
          src={ChangeIcon}
          alt='Conversión'
          className='w-5 h-5'
        />
      ),
    },

  ];
  const items = isAdmin
    ? adminItems
    : userItems;

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
  <div className='flex items-center gap-2'>
    
    <img
      src={CrediExpressLogo}
      alt='Logo'
      className='h-10 w-10  object-contain'
    />

    <div>
      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>
        {isAdmin
          ? 'Panel administrativo'
          : 'Panel de usuario'}
      </p>
    </div>

  </div>
</div>
        <div className='px-4 py-6'>
          <div className='flex items-center gap-3'>
            <div className='h-12 w-12 rounded-full bg-gradient-to-br from-[#E11D48] to-[#FF1744] flex items-center justify-center text-white font-bold'>
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div>
              <p className='text-white text-sm'>
                {user?.username || 'Sin usuario'}
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
                      flex items-center gap-3 px-4 py-3 rounded-2xl transition
                      ${active
                        ? 'bg-[#123B7A] text-white'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className='mt-auto px-3 pb-4 pt-4 '>
          <button
            onClick={onLogout}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-transparent hover:bg-[#c81b42] text-white font-medium transition'
          >
            <img
              src={LogoutIcon}
              alt='Logout'
              className='w-5 h-5' />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};