import { useEffect } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';

export const AdminReportsPage = () => {
  const { users, getAllUsers, requests, getAccountRequests, isLoading } = useAdminStore();
  const { accounts, getAllAccounts } = useAccountStore();

  useEffect(() => {
    getAllUsers();
    getAccountRequests();
    // En el futuro getAllAccounts si el admin tiene acceso global
  }, [getAllUsers, getAccountRequests]);

  // Datos para gráfico de roles
  const rolesData = [
    { name: 'Administradores', value: users.filter(u => u.role === 'ADMIN_ROLE').length },
    { name: 'Clientes', value: users.filter(u => u.role === 'USER_ROLE').length },
  ];

  const COLORS = ['#1a3a2a', '#2d6a4f', '#40916c', '#52b788'];

  // Datos para solicitudes
  const requestsData = [
    { name: 'Pendientes', value: requests.filter(r => r.status === 'PENDIENTE').length },
    { name: 'Aprobadas', value: requests.filter(r => r.status === 'APROBADA').length },
    { name: 'Rechazadas', value: requests.filter(r => r.status === 'RECHAZADA').length },
  ];

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <div className="bank-card p-8 group hover:border-primary transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-black uppercase tracking-tighter ${trend > 0 ? 'text-green-500' : 'text-amber-500'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-[10px] font-black uppercase text-text-secondary tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-text-primary tracking-tighter">{value}</h3>
    </div>
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter">
          Panel de <span className="text-primary">Analíticas</span> 📈
        </h1>
        <p className="text-text-secondary font-medium mt-2">Visión global del rendimiento y crecimiento institucional.</p>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Calculando métricas...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Usuarios" 
              value={users.length} 
              icon={Users} 
              trend={12} 
              color="bg-[#1a3a2a]" 
            />
            <StatCard 
              title="Solicitudes" 
              value={requests.length} 
              icon={Building2} 
              trend={-5} 
              color="bg-[#2d6a4f]" 
            />
            <StatCard 
              title="Cuentas Activas" 
              value="156" 
              icon={Wallet} 
              trend={24} 
              color="bg-[#40916c]" 
            />
            <StatCard 
              title="Capital Global" 
              value="Q 1.2M" 
              icon={TrendingUp} 
              trend={8} 
              color="bg-[#52b788]" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Distribución de Roles */}
            <div className="bank-card">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <PieIcon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Distribución de Roles</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rolesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {rolesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Estado de Solicitudes */}
            <div className="bank-card">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Flujo de Solicitudes</h3>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={requestsData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" fill="#2d6a4f" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
