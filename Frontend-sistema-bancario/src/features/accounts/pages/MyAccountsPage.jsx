import { useEffect, useState } from 'react';
import { useMoney } from '../../../shared/hooks/useMoney';
import { useAccountStore } from '../store/useAccountStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Wallet, Plus, ArrowRight, Loader2, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyAccountsPage = () => {
  const { accounts, getAccounts, isLoading, error } = useAccountStore();
  const { user } = useAuthStore();
  const { format } = useMoney();

const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    // Si hay un usuario, y no estamos cargando, y aún no hemos hecho la petición inicial...
    if (user?.id && !isLoading && !hasFetched) {
      getAccounts(user.id);
      setHasFetched(true); // Marcamos que la petición ya se envió
    }
  }, [user?.id, isLoading, hasFetched, getAccounts]);

  // Si el usuario cambia (por ejemplo, cierra sesión e inicia otra), reiniciamos la bandera
  useEffect(() => {
    setHasFetched(false);
  }, [user?.id]);
  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
            Mis <span className="text-primary">Productos</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Landmark className="w-6 h-6 text-primary" />
            </span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">Gestiona tus cuentas monetarias y de ahorro.</p>
        </div>
        
        <Link 
          to="/dashboard/accounts/new"
          className="btn-primary flex items-center justify-center gap-2 h-14"
        >
          <Plus className="w-5 h-5" />
          Solicitar Nueva Cuenta
        </Link>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Cargando tus activos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div key={acc._id} className="bank-card group flex flex-col justify-between h-[240px] relative overflow-hidden">
              {/* Decorative circle */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors" />
              
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-2xl ${
                    acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    <Landmark className="w-6 h-6" />
                  </div>
                  <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                    acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {acc.type}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-text-primary">No. {acc.accountNumber}</h3>
                <p className="text-sm text-text-secondary mt-1">{acc.alias || 'Cuenta Personal'}</p>
              </div>

              <div className="mt-auto pt-6 border-t border-border flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Saldo Disponible</p>
                  <h4 className="text-2xl font-black text-text-primary tracking-tighter">
                    {format(acc.balance)}
                  </h4>
                </div>
                
                <Link 
                  to={`/dashboard/history/${acc._id}`}
                  className="w-10 h-10 bg-background border border-border rounded-xl flex items-center justify-center text-text-secondary hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}

          {accounts.length === 0 && (
            <div className="col-span-full py-20 bank-card bg-background border-dashed border-2 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                <Wallet className="w-10 h-10 text-text-secondary/20" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">No se encontraron cuentas</h3>
              <p className="text-text-secondary text-sm mb-8 max-w-sm text-center">
                Parece que aún no tienes productos financieros activos. Solicita tu primera cuenta ahora mismo.
              </p>
              <Link to="/dashboard/accounts/new" className="btn-primary">
                Comenzar ahora
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};