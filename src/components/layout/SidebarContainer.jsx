import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

export function SidebarContainer({ children }) {
  const { dark } = useAppContext();
  
  return (
    <div className={`flex h-screen overflow-hidden ${dark ? "dark" : ""}`} style={{ background: "var(--bg)" }}>
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="min-h-full bg-grid-light dark:bg-grid-dark">
            {children}
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
