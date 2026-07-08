import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { CurrencyPicker } from '../../shared/components/CurrencyPicker';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useSidebarStore } from '../../shared/store/useSidebarStore';
import { Menu } from 'lucide-react';

export const DashboardLayout = () => {
  const { role, user, getProfile } = useAuthStore();
  const { toggle } = useSidebarStore();

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div className="flex min-h-screen bg-background font-inter">
      <Sidebar />

      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-20">

          <div className="flex items-center gap-3">
            <button onClick={toggle} className="text-text-primary lg:hidden cursor-pointer">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base sm:text-xl font-bold text-text-primary capitalize">
              {role === 'ADMIN_ROLE' ? 'Panel de Control' : 'Mi Banca Digital'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <CurrencyPicker />

            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-text-primary leading-none tracking-tight">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-1">
                  @{user?.username}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary-dark rounded-xl flex items-center justify-center shadow-md">
                <Wallet className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};