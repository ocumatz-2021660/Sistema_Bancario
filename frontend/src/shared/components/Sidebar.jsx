import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { 
  Home, 
  Wallet, 
  Send, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Gift, 
  History, 
  Star, 
  User, 
  Users, 
  FileText, 
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { role, logout } = useAuthStore();

  const userLinks = [
    { to: '/dashboard', label: 'Inicio', icon: Home },
    { to: '/dashboard/accounts', label: 'Mis Cuentas', icon: Wallet },
    { to: '/dashboard/transfer', label: 'Transferir', icon: Send },
    { to: '/dashboard/withdrawals', label: 'Retiros', icon: ArrowDownCircle },
    { to: '/dashboard/deposits', label: 'Depósitos', icon: ArrowUpCircle },
    { to: '/dashboard/history', label: 'Historial', icon: History },
    { to: '/dashboard/services', label: 'Servicios', icon: Gift },
    { to: '/dashboard/redeems', label: 'Mis Canjes', icon: History },
    { to: '/dashboard/favorites', label: 'Favoritos', icon: Star },
    { to: '/dashboard/profile', label: 'Mi Perfil', icon: User },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Panel Admin', icon: LayoutDashboard },
    { to: '/dashboard/admin/users', label: 'Gestión Usuarios', icon: Users },
    { to: '/dashboard/admin/requests', label: 'Solicitudes', icon: FileText },
    { to: '/dashboard/admin/accounts', label: 'Todas las Cuentas', icon: Wallet },
    { to: '/dashboard/admin/services', label: 'Servicios', icon: Gift },
    { to: '/dashboard/admin/reports', label: 'Reportes', icon: History },
    { to: '/dashboard/profile', label: 'Mi Perfil', icon: User },
  ];

  const links = role === 'ADMIN_ROLE' ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-primary-dark text-white flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl">
      <div className="p-8 flex flex-col items-center border-b border-white/10">
        <div className="w-12 h-12 bg-primary-light rounded-2xl mb-4 flex items-center justify-center shadow-inner">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-black tracking-tighter uppercase leading-none">
          Cyber<span className="text-primary-light">Vaul</span>
        </h2>
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-2">
          {role === 'ADMIN_ROLE' ? 'Administration' : 'Client Access'}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                ? 'bg-primary text-white shadow-lg shadow-black/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <link.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-semibold">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-semibold">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};