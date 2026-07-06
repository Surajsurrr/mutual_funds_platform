import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useState } from 'react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0B1329' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} isSidebarOpen={sidebarOpen} />

      <div className="flex pt-[110px] gap-8 lg:gap-10">
        {/* Desktop Sidebar Spacer */}
        <div className="hidden lg:block w-80 flex-shrink-0" />

        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onClose={() => { }} />
        </div>

        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="min-w-0 p-6 lg:p-10 max-w-[1100px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
