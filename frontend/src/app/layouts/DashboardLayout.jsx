import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { Bell, Search, User as UserIcon } from 'lucide-react';

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
            <div className="hidden md:flex items-center bg-background border border-border rounded-xl px-4 py-2 gap-2 w-64 focus-within:border-primary transition-colors">
              <Search className="w-4 h-4 text-text-secondary" />
              <input 
                type="text" 
                placeholder="Buscar transacción..." 
                className="bg-transparent border-none outline-none text-xs w-full"
              />
            </div>

            <button className="relative p-2 text-text-secondary hover:text-primary transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-border">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-text-primary leading-none mb-1">
                  {user?.name} {user?.surname}
                </p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {role === 'ADMIN_ROLE' ? 'Administrador' : 'Cliente Platinum'}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
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
