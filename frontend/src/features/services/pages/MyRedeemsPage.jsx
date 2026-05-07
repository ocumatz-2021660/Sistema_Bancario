import { useEffect, useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { 
  History, 
  Wallet, 
  Calendar, 
  Loader2, 
  ShoppingBag,
  ArrowRight,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyRedeemsPage = () => {
  const { accounts, getAccounts } = useAccountStore();
  const { redeems, getRedeems, isLoading } = useServiceStore();
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    getAccounts();
  }, [getAccounts]);

  useEffect(() => {
    if (selectedAccountId) {
      getRedeems(selectedAccountId);
    }
  }, [selectedAccountId, getRedeems]);

  const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Mis <span className="text-primary">Pagos</span> 🏷️
          </h1>
          <p className="text-text-secondary font-medium mt-2">Revisa el historial de tus canjes y pagos de servicios.</p>
        </div>

        <div className="relative group min-w-[280px]">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Wallet className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          </div>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="input-field pl-12 cursor-pointer appearance-none"
          >
            <option value="">Seleccione una cuenta...</option>
            {accounts.map(acc => (
              <option key={acc._id} value={acc._id}>
                {acc.accountNumber} - {acc.type}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </header>

      {!selectedAccountId ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bank-card border-dashed bg-transparent border-2">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-text-secondary/20" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Seleccione una cuenta</h3>
          <p className="text-text-secondary text-sm max-w-sm">
            Elija la cuenta desde la cual realizó los pagos para ver su historial detallado.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Recuperando historial...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {redeems.map((redeem) => (
            <div key={redeem._id} className="bank-card p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <ShoppingBag className="w-8 h-8" />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-black text-text-primary tracking-tight">
                  {redeem.service?.name || 'Servicio Desconocido'}
                </h4>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(redeem.createdAt), "dd MMM yyyy, hh:mm a", { locale: es })}
                  </div>
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest px-3 py-1 bg-primary/5 rounded-full">
                    Canje Exitoso
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8 pr-4">
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Monto Pagado</p>
                  <p className="text-2xl font-black text-text-primary tracking-tighter">Q {redeem.points?.toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}

          {redeems.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-text-secondary/10" />
              </div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No se encontraron pagos recientes</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
