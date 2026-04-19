import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaBook, FaUsers, FaExchangeAlt, FaBullhorn, FaFire } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/admin/books', label: 'Manage Books', icon: FaBook },
    { path: '/admin/users', label: 'Manage Users', icon: FaUsers },
    { path: '/admin/borrowings', label: 'Manage Borrowings', icon: FaExchangeAlt },
    { path: '/admin/announcements', label: 'Announcements', icon: FaBullhorn },
    { path: '/admin/smoke-alerts', label: 'Smoke Alerts', icon: FaFire },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="flex">
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Admin Portal</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-1 ${
                    isActive ? 'bg-[#2C1F14] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </aside>

        <main className="ml-64 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;