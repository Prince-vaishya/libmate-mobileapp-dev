import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
// No SearchBar import here

const MemberLayout = () => {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <Navbar />
      <main className="pt-16 pb-16">
        <Outlet />
      </main>
    </div>
  );
};

export default MemberLayout;