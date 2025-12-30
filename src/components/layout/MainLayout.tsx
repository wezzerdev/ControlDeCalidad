import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className="print:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
