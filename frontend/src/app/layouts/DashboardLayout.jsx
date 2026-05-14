import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { CurrencyPicker } from '../../shared/components/CurrencyPicker';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { UserAvatar } from '../../shared/components/UserAvatar';

export const DashboardLayout = () => {
  const { user, role } = useAuthStore();

  return (
    <div className="flex min-h-screen bg-background font-inter">
      {/* Sidebar Fijo */}
      <Sidebar />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Header Superior */}
        <header className="h-20 bg-surface border-b border-border flex items-center justify-between px-10 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-text-primary capitalize">
              {role === 'ADMIN_ROLE' ? 'Panel de Control' : 'Mi Banca Digital'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <CurrencyPicker />
            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary leading-none mb-1">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {role === 'ADMIN_ROLE'
                    ? 'Administrador'
                    : `@${user?.username}`}
                </p>
              </div>
              <UserAvatar
                src={user?.profilePicture}
                className="w-10 h-10 border border-primary/20"
              />
            </div>
          </div>
        </header>

        {/* Zona de Contenido */}
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
