import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar/Navbar';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { useState } from 'react';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0B1220' }}>
      <Navbar onMenuToggle={() => setSidebarOpen(o => !o)} isSidebarOpen={sidebarOpen} />

      {/* Overlay to close sidebar on mobile when tapping outside */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex dashboard-content-wrapper" style={{ paddingTop: '64px' }}>
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

        {/* Main Content — fill the area after the sidebar and center an inner
            column via flex (align-items:center) so wide screens stay balanced
            instead of shoving content against the sidebar. Using items-center
            rather than mx-auto avoids flex auto-margin quirks. */}
        <main className="min-w-0 flex-1 flex flex-col items-center">
          <div className="w-full max-w-[1360px] px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
