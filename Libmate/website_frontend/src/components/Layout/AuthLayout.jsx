import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;