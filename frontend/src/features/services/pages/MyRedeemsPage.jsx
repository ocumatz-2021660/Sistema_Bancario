import { useEffect, useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  Wallet,
  Calendar,
  Loader2,
  ShoppingBag,
  Filter,
  Tag,
  Star,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export const MyRedeemsPage = () => {
  const { accounts, getAccounts } = useAccountStore();
  const { redeems, getRedeems, deleteRedeems, isLoading } = useServiceStore();
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const { user } = useAuthStore();

  const handleDelete = async (redeem) => {
    if (!confirm('¿Deseas cancelar este pago de servicio?')) return;
    const result = await deleteRedeems(redeem._id, selectedAccountId);
    if (result.success) {
      toast.success('Servicio cancelado y lista actualizada');
      getAccounts(user?.id);
    } else {
      toast.error(result.error);
    }
  };

  useEffect(() => {
    getAccounts(user?.id);
  }, [getAccounts, user]);

  useEffect(() => {
    if (selectedAccountId) {
      getRedeems(selectedAccountId);
    }
  }, [selectedAccountId, getRedeems]);

  const selectedAccount = accounts.find((acc) => acc._id === selectedAccountId);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Mis <span className="text-primary">Pagos</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 ml-3">
              <Tag className="w-6 h-6 text-primary" />
            </span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">
            Revisa el historial de tus canjes y pagos de servicios.
          </p>
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
            {accounts.map((acc) => (
              <option key={acc._id} value={acc._id}>
                {acc.accountNumber} — {acc.type}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
            <Filter className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Panel de puntos de la cuenta seleccionada */}
      {selectedAccount && (
        <div className="bank-card bg-primary-dark text-white border-none flex items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">
              Cuenta
            </p>
            <p className="text-lg font-black tracking-tight">
              No. {selectedAccount.accountNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">
              Puntos Disponibles
            </p>
            <p className="text-3xl font-black tracking-tighter text-primary-light flex items-center gap-2 justify-end">
              <Star className="w-6 h-6 fill-primary-light" />
              {selectedAccount.puntos_cuenta?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      )}

      {!selectedAccountId ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bank-card border-dashed bg-transparent border-2">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-text-secondary/20" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">
            Seleccione una cuenta
          </h3>
          <p className="text-text-secondary text-sm max-w-sm">
            Elija la cuenta desde la cual realizó los canjes para ver su
            historial detallado.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">
            Recuperando historial...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {redeems.map((redeem) => (
            <div
              key={redeem._id}
              className="bank-card p-6 flex flex-col md:flex-row items-center gap-6 hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                <ShoppingBag className="w-8 h-8" />
              </div>

              <div className="flex-1 text-center md:text-left">
                <h4 className="text-lg font-black text-text-primary tracking-tight">
                  {redeem.serviceName || 'Servicio'}
                </h4>
                {redeem.description && (
                  <p className="text-xs text-text-secondary mt-1">
                    {redeem.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {redeem.date
                      ? format(new Date(redeem.date), 'dd MMM yyyy, hh:mm a', {
                          locale: es,
                        })
                      : '—'}
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      redeem.estado_canje === 'CANCELADO'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-primary/5 text-primary'
                    }`}
                  >
                    {redeem.estado_canje === 'CANCELADO'
                      ? 'Cancelado'
                      : 'Canje Exitoso'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-4">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div className="text-right">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5">
                    Puntos usados
                  </p>
                  <p className="text-2xl font-black text-text-primary tracking-tighter">
                    {redeem.cost?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(redeem)}
                title="Eliminar cuenta permanentemente"
                className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {redeems.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center bank-card border-dashed border-2">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-text-secondary/10" />
              </div>
              <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">
                No hay canjes registrados
              </p>
              <p className="text-xs text-text-secondary mt-2">
                Acumula puntos haciendo transacciones y canjéalos en Servicios.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};