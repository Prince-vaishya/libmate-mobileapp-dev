import React, { useState } from 'react';
import { FaExclamationTriangle, FaBook, FaUsers, FaExchangeAlt, FaFire } from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [smokeAlertActive, setSmokeAlertActive] = useState(true);

  const stats = [
    { label: 'Total Members', value: '382', sub: '+12 this month', icon: FaUsers, color: 'bg-blue' },
    { label: 'Books Available', value: '1,847', sub: 'of 2,400 total', icon: FaBook, color: 'bg-green' },
    { label: 'Active Borrowings', value: '553', sub: 'across all members', icon: FaExchangeAlt, color: 'bg-amber' },
    { label: 'Overdue Books', value: '24', sub: 'NPR 1,200 in fines', icon: FaExclamationTriangle, color: 'bg-red' },
    { label: 'Pending Memberships', value: '3', sub: 'Awaiting approval', icon: FaUsers, color: 'bg-amber' },
    { label: 'Active Smoke Alert', value: '1', sub: 'Detected 2:34 PM', icon: FaFire, color: 'bg-red' },
  ];

  const overdueBorrowings = [
    { member: 'Pujan G.', book: 'Deep Work', daysOverdue: 2, fine: 'NPR 10' },
    { member: 'Alice T.', book: 'Clean Code', daysOverdue: 5, fine: 'NPR 25' },
    { member: 'Garima A.', book: 'Sapiens', daysOverdue: 1, fine: 'NPR 5' },
  ];

  return (
    <div>
      {smokeAlertActive && (
        <div className="bg-red text-white p-3 rounded-radius2 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse-slow"></div>
            <span className="font-semibold">⚠ Smoke Detected!</span>
            <span className="text-sm">Sensor: 685 (Threshold: 400) · Device: ESP32-LIB-01</span>
          </div>
          <button onClick={() => setSmokeAlertActive(false)} className="bg-white/20 px-3 py-1 rounded-full text-sm hover:bg-white/30 transition">Resolve Alert</button>
        </div>
      )}

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">Admin Dashboard</h1>
        <p className="text-muted mt-1">System overview and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="card">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center`}>
                  <Icon className="text-white text-sm" />
                </div>
              </div>
              <div className="text-2xl font-serif font-bold text-ink">{stat.value}</div>
              <div className="text-xs text-muted mt-0.5">{stat.label}</div>
              <div className="text-xs text-muted">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="card mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-bold text-ink">Overdue Borrowings</h2>
          <button className="text-accent text-sm">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-cream3">
              <tr className="text-left text-muted">
                <th className="pb-2 font-semibold">Member</th>
                <th className="pb-2 font-semibold">Book</th>
                <th className="pb-2 font-semibold">Overdue</th>
                <th className="pb-2 font-semibold">Fine</th>
                <th className="pb-2 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {overdueBorrowings.map((item, idx) => (
                <tr key={idx} className="border-b border-cream3 last:border-0">
                  <td className="py-3">{item.member}</td>
                  <td className="py-3">{item.book}</td>
                  <td className="py-3"><span className="badge-red">{item.daysOverdue} days</span></td>
                  <td className="py-3 text-red font-medium">{item.fine}</td>
                  <td className="py-3"><button className="btn-green text-xs py-1 px-3 rounded-full">Process</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-xl font-bold text-ink">Recent Membership Requests</h2>
          <button className="text-accent text-sm">View all</button>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-cream2 rounded-radius2">
            <div><span className="font-semibold">Rajan K.</span><span className="text-xs text-muted ml-2">6 months · NPR 500</span></div>
            <span className="badge-green self-start sm:self-auto">Paid</span>
            <button className="btn-primary text-xs py-1 px-3 self-start sm:self-auto">Approve</button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-cream2 rounded-radius2">
            <div><span className="font-semibold">Sita M.</span><span className="text-xs text-muted ml-2">3 months · NPR 200</span></div>
            <span className="badge-amber self-start sm:self-auto">Pending</span>
            <button className="btn-secondary text-xs py-1 px-3 self-start sm:self-auto">Review</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;