import React from 'react';
import { Sidebar } from './layouts/Sidebar';
import fondoDashboard from "../../assets/img/FondoAdmin.jpg"

export const DashboardContainer = ({ user, onLogout, children }) => {
  return (
    <div
      className='h-screen overflow-hidden flex flex-col bg-cover bg-center'
      style={{
        backgroundImage: `linear-gradient(rgba(2, 6, 23, 0.96), rgba(2, 6, 23, 0.96)), url(${fondoDashboard})`
      }}
    >
      

      <div className='flex flex-1 overflow-hidden'>
        <Sidebar user={user} onLogout={onLogout} />

        <main className='flex-1 overflow-y-auto p-6'>
          {children}
        </main>
      </div>
    </div>
  );
};

