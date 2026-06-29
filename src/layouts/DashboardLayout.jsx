import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-900">
      <Navbar
        onMenuToggle={() => setSidebarOpen(o => !o)}
        isSidebarOpen={sidebarOpen}
      />

      <div className="flex pt-[88px]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="fixed left-0 top-[88px] bottom-0 w-64 glass border-r border-blue-600/10 overflow-y-auto">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
