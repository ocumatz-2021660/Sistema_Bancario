import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { UserAvatar } from '../components/UserAvatar';
import {
  Home,
  Wallet,
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  Gift,
  History,
  Star,
  Users,
  CircleUserRound,
  FileText,
  LayoutDashboard,
  LogOut
} from 'lucide-react';

export const Sidebar = () => {
  const { role, logout, user } = useAuthStore();

  const userLinks = [
    { to: '/dashboard', label: 'Inicio', icon: Home },
    { to: '/dashboard/accounts', label: 'Mis Cuentas', icon: Wallet },
    { to: '/dashboard/transfer', label: 'Transferir', icon: Send },
    { to: '/dashboard/withdrawals', label: 'Retiros', icon: ArrowDownCircle },
    { to: '/dashboard/history', label: 'Historial', icon: History },
    { to: '/dashboard/services', label: 'Servicios', icon: Gift },
    { to: '/dashboard/redeems', label: 'Mis Canjes', icon: History },
    { to: '/dashboard/favorites', label: 'Favoritos', icon: Star },
    { to: '/dashboard/profile', label: 'Mi Perfil', icon: CircleUserRound },
  ];

  const adminLinks = [
    { to: '/dashboard', label: 'Panel Admin', icon: LayoutDashboard },
    { to: '/dashboard/admin/users', label: 'Gestión Usuarios', icon: Users },
    { to: '/dashboard/admin/requests', label: 'Solicitudes', icon: FileText },
    { to: '/dashboard/admin/accounts', label: 'Todas las Cuentas', icon: Wallet },
    { to: '/dashboard/admin/services', label: 'Servicios', icon: Gift },
    { to: '/dashboard/deposits', label: 'Depósitos', icon: ArrowUpCircle },
    { to: '/dashboard/profile', label: 'Mi Perfil', icon: CircleUserRound },
  ];

  const links = role === 'ADMIN_ROLE' ? adminLinks : userLinks;

  return (
    <aside className="w-64 bg-primary-dark text-white flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl">


      {/* Usuario arriba */}
      <div className="px-6 py-8 flex flex-col items-center gap-3 border-b border-white/10">
        <UserAvatar src={user?.profilePicture} className="w-16 h-16 border-2 border-white/20" />
        <div className="text-center">
          <p className="text-sm font-bold text-white leading-snug">
            {user?.name} {user?.surname}
          </p>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">
            {role === 'ADMIN_ROLE' ? 'Administrador' : `@${user?.username}`}
          </p>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
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

      {/* Cerrar sesión */}
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