import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useState } from 'react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ background: '#F5F4F7' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-[90px]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="fixed left-0 top-[90px] bottom-0 w-64 overflow-y-auto"
            style={{ background: '#202C44', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
