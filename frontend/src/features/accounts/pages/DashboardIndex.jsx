import { useAuthStore } from '../../auth/store/useAuthStore';
import { useAccountStore } from '../store/useAccountStore';
import { useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft,
  User as UserIcon
} from 'lucide-react';

export const DashboardIndex = () => {
  const { user, role } = useAuthStore();
  const { accounts, getAccounts } = useAccountStore();

  useEffect(() => {
    if (role === 'USER_ROLE') {
      getAccounts();
    }
  }, [role, getAccounts]);

  if (role === 'ADMIN_ROLE') {
    return <AdminDashboard />;
  }

  return <UserDashboard user={user} accounts={accounts} />;
};

const UserDashboard = ({ user, accounts }) => (
  <div className="space-y-10">
    <header>
      <h1 className="text-4xl font-black text-text-primary tracking-tighter">
        Hola, <span className="text-primary">{user?.name}</span> 👋
      </h1>
      <p className="text-text-secondary font-medium mt-2">Bienvenido a tu resumen financiero de hoy.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bank-card bg-primary-dark text-white border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <Wallet className="w-20 h-20" />
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2">Saldo Total Consolidado</p>
        <h3 className="text-3xl font-black tracking-tighter">
          Q {accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0).toLocaleString()}
        </h3>
        <div className="mt-6 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" /> +2.4% este mes
        </div>
      </div>

      <div className="bank-card">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-green-500/10 rounded-xl">
            <ArrowUpRight className="w-6 h-6 text-green-500" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase">Ingresos</span>
        </div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Este Mes</p>
        <h3 className="text-2xl font-black text-text-primary tracking-tighter">Q 12,450.00</h3>
      </div>

      <div className="bank-card">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-red-500/10 rounded-xl">
            <ArrowDownLeft className="w-6 h-6 text-red-500" />
          </div>
          <span className="text-[10px] font-bold text-text-secondary uppercase">Egresos</span>
        </div>
        <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Este Mes</p>
        <h3 className="text-2xl font-black text-text-primary tracking-tighter">Q 8,120.00</h3>
      </div>
    </div>

    <section>
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black text-text-primary tracking-tight">Mis Cuentas</h2>
          <p className="text-sm text-text-secondary">Estado actual de tus productos financieros</p>
        </div>
        <button className="text-sm font-bold text-primary hover:underline">Ver todas</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.slice(0, 2).map((acc) => (
          <div key={acc._id} className="bank-card flex items-center gap-6 group">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
            }`}>
              <Wallet className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">{acc.type}</p>
              <h4 className="font-bold text-text-primary">No. {acc.accountNumber}</h4>
              <p className="text-xs text-text-secondary mt-1">Alias: {acc.alias || 'Sin alias'}</p>
            </div>
            <div className="text-right">
              <h4 className="text-xl font-black text-text-primary tracking-tighter">Q {acc.balance?.toLocaleString()}</h4>
              <p className="text-[10px] font-bold text-green-500 uppercase mt-1">Activa</p>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="md:col-span-2 p-10 bg-surface rounded-2xl border-2 border-dashed border-border text-center">
            <p className="text-text-secondary font-medium">No tienes cuentas activas. Solicita una para empezar.</p>
          </div>
        )}
      </div>
    </section>
  </div>
);

const AdminDashboard = () => (
  <div className="space-y-10">
    <header>
      <h1 className="text-4xl font-black text-text-primary tracking-tighter">
        Consola de <span className="text-primary">Administración</span> 🛡️
      </h1>
      <p className="text-text-secondary font-medium mt-2">Monitoreo global del sistema bancario.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Usuarios Activos', val: '1,240', icon: Users, color: '#2d6a4f' },
        { label: 'Solicitudes Pendientes', val: '12', icon: FileText, color: '#f59e0b' },
        { label: 'Transacciones Hoy', val: '458', icon: ArrowUpRight, color: '#10b981' },
        { label: 'Volumen Diario', val: 'Q 2.4M', icon: TrendingUp, color: '#3b82f6' },
      ].map((stat, i) => (
        <div key={i} className="bank-card">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
            style={{ backgroundColor: `${stat.color}15` }}
          >
            <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
          </div>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{stat.label}</p>
          <h3 className="text-2xl font-black text-text-primary tracking-tighter">{stat.val}</h3>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bank-card">
        <h3 className="text-xl font-black mb-6">Actividad Reciente</h3>
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 pb-6 border-b border-border last:border-none last:pb-0">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-text-secondary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Nuevo registro de usuario</p>
                <p className="text-xs text-text-secondary">Hace 5 minutos</p>
              </div>
              <span className="text-[10px] font-black text-primary uppercase">Detalles</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bank-card bg-primary-dark text-white border-none">
        <h3 className="text-xl font-black mb-4">Métricas de Seguridad</h3>
        <p className="text-white/60 text-sm mb-8">Estado de los servicios y firewalls institucionales.</p>
        <div className="space-y-4">
          {['Auth Service', 'Transaction Engine', 'Points Engine', 'Database Cluster'].map(s => (
            <div key={s} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <span className="text-sm font-semibold">{s}</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-500">Online</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
