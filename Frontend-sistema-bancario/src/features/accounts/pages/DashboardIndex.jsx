import { useAuthStore } from '../../auth/store/useAuthStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { useAccountStore } from '../store/useAccountStore';
import { useEffect, useState } from 'react';
import { useMoney } from '../../../shared/hooks/useMoney';
import {
  Wallet,
  TrendingUp,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  HandCoins,
  ShieldCheck
} from 'lucide-react';
import api from '../../../shared/api/axios';

export const DashboardIndex = () => {
  const { user, role } = useAuthStore();
  const { accounts, getAccounts, isLoading, error } = useAccountStore();

  useEffect(() => {
    if (role === 'USER_ROLE' && accounts.length === 0 && !isLoading && !error) {
      getAccounts(user?.id);
    }
  }, [role, getAccounts, user, accounts.length, isLoading, error]);

  if (role === 'ADMIN_ROLE') {
    return <AdminDashboard />;
  }

  return <UserDashboard user={user} accounts={accounts} />;
};

const UserDashboard = ({ user, accounts }) => {
  const { format } = useMoney();
  const totalBalance = accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalAhorro = accounts
    .filter(a => a.type === 'AHORRO')
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);
  const totalMonetaria = accounts
    .filter(a => a.type === 'MONETARIA')
    .reduce((acc, curr) => acc + (curr.balance || 0), 0);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
          Hola, <span className="text-primary">{user?.name}</span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <HandCoins className="w-6 h-6 text-primary" />
          </span>
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
            {format(totalBalance)}
          </h3>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" /> {accounts.length} cuenta{accounts.length !== 1 ? 's' : ''} activa{accounts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bank-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <ArrowUpRight className="w-6 h-6 text-green-500" />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase">Ahorro</span>
          </div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Saldo en Ahorros</p>
          <h3 className="text-2xl font-black text-text-primary tracking-tighter">
            {format(totalAhorro)}
          </h3>
        </div>

        <div className="bank-card">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <ArrowDownLeft className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold text-text-secondary uppercase">Monetaria</span>
          </div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">Saldo Monetario</p>
          <h3 className="text-2xl font-black text-text-primary tracking-tighter">
            {format(totalMonetaria)}
          </h3>
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                }`}>
                <Wallet className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">{acc.type}</p>
                <h4 className="font-bold text-text-primary">No. {acc.accountNumber}</h4>
                <p className="text-xs text-text-secondary mt-1">Alias: {acc.alias || 'Sin alias'}</p>
              </div>
              <div className="text-right">
                <h4 className="text-xl font-black text-text-primary tracking-tighter">
                  {format(acc.balance)}
                </h4>
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
};

const AdminDashboard = () => {
  const { users, requests, getAllUsers, getAccountRequests } = useAdminStore();
  const { format } = useMoney();
  const [actividad, setActividad] = useState([]);
  const [loadingActividad, setLoadingActividad] = useState(true);
  const loadingStats = users.length === 0;

  useEffect(() => {
    // Solo cargar si el store está vacío (evita recargas innecesarias al navegar)
    if (users.length === 0) getAllUsers(1, 200);
    if (requests.length === 0) getAccountRequests('PENDIENTE');

    const fetchActividad = async () => {
      try {
        const res = await api.get('/transactions?limit=5');
        setActividad(res.data.data || []);
      } catch {
        setActividad([]);
      } finally {
        setLoadingActividad(false);
      }
    };
    fetchActividad();
  }, []);

  const stats = {
    usuarios: users.length > 0 ? users.length.toLocaleString() : '-',
    pendientes: requests.filter(r => r.estado_solicitud === 'PENDIENTE').length.toLocaleString(),
    transacciones: '-',
  };

  const statCards = [
    { label: 'Usuarios Activos', val: loadingStats ? '-' : users.length.toLocaleString(), icon: Users, color: '#2d6a4f' },
    { label: 'Solicitudes Pendientes', val: loadingStats ? '-' : requests.filter(r => r.estado_solicitud === 'PENDIENTE').length.toLocaleString(), icon: FileText, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black flex flex-wrap items-center gap-2">
          Consola de <span className="text-primary">Administración</span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </span>
        </h1>
        <p className="text-text-secondary font-medium mt-2">Monitoreo global del sistema bancario.</p>
      </header>

      <div className="bank-card">
        <h3 className="text-xl font-black mb-6">Actividad Reciente</h3>
        {loadingActividad ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 pb-6 border-b border-border last:border-none last:pb-0">
                <div className="w-10 h-10 rounded-full bg-surface animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-surface animate-pulse rounded w-40" />
                  <div className="h-2 bg-surface animate-pulse rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : actividad.length === 0 ? (
          <p className="text-text-secondary text-sm">No hay transacciones registradas.</p>
        ) : (
          <div className="space-y-6">
            {actividad.map((t, i) => {
              const tipo = t.tipo_transaccion || 'Transacción';
              const monto = t.monto != null ? format(Number(t.monto)) : '';
              const fecha = t.createdAt
                ? new Date(t.createdAt).toLocaleString('es-GT', { dateStyle: 'short', timeStyle: 'short' })
                : '';
              return (
                <div key={t._id || i} className="flex items-center gap-4 pb-6 border-b border-border last:border-none last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold capitalize">{tipo.toLowerCase()}</p>
                    <p className="text-xs text-text-secondary truncate">{fecha}</p>
                  </div>
                  <span className="text-sm font-black text-primary whitespace-nowrap">{monto}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bank-card">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">{stat.label}</p>
            {loadingStats
              ? <div className="h-8 w-20 bg-surface animate-pulse rounded-lg mt-1" />
              : <h3 className="text-2xl font-black text-text-primary tracking-tighter">{stat.val}</h3>
            }
          </div>
        ))}
      </div>

    </div>
  );
};
