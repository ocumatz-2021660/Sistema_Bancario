import { useEffect, useState } from 'react';
import { useServiceStore } from '../store/useServiceStore';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';
import { 
  Zap, 
  Droplets, 
  Wifi, 
  Phone, 
  Gift, 
  Search, 
  Loader2, 
  CheckCircle2, 
  X,
  CreditCard,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

export const ServicesCatalogPage = () => {
  const { services, getServices, redeemService, isLoading: serviceLoading, error: serviceError } = useServiceStore();
  const { accounts, getAccounts, isLoading: accountsLoading, error: accountsError } = useAccountStore();
  const { user } = useAuthStore();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (services.length === 0 && !serviceLoading && !serviceError) {
      getServices();
    }
    if (user?.id && accounts.length === 0 && !accountsLoading && !accountsError) {
      getAccounts(user.id);
    }
  }, [getServices, getAccounts, user, services.length, serviceLoading, serviceError, accounts.length, accountsLoading, accountsError]);

  const handleRedeemClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedAccountId) {
      return toast.error('Seleccione una cuenta para el pago');
    }

    const result = await redeemService({
      serviceId: selectedService._id,
      accountId: selectedAccountId
    });

    if (result.success) {
      toast.success('¡Pago realizado con éxito!');
      setIsModalOpen(false);
      setSelectedAccountId('');
      getAccounts(user?.id); // Actualizar saldos
    } else {
      toast.error(result.error);
    }
  };

  // Helper para iconos según descripción o nombre
  const getServiceIcon = (name) => {
    /*
    const n = name.toLowerCase();
    if (n.includes('luz') || n.includes('energía')) return <Zap className="w-6 h-6" />;
    if (n.includes('agua')) return <Droplets className="w-6 h-6" />;
    if (n.includes('internet') || n.includes('wifi')) return <Wifi className="w-6 h-6" />;
    if (n.includes('teléfono') || n.includes('celular')) return <Phone className="w-6 h-6" />;
    return <Gift className="w-6 h-6" />;
    */
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Pagos y <span className="text-primary">Servicios</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"><ShoppingBag className="w-6 h-6 text-primary" /></span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">Paga tus facturas y canjea beneficios institucionales.</p>
        </div>

        <div className="relative group w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar servicio..." 
            className="input-field pl-12 h-12"
          />
        </div>
      </header>

      {serviceLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Conectando con proveedores...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service._id} className="bank-card group hover:border-primary transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    {getServiceIcon(service.name)}
                  </div>
                  <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 px-3 py-1 rounded-full">
                    Disponible
                  </span>
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-2">{service.nombre_servicio}</h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-6">
                  {service.descripcion_servicio || 'Sin descripción disponible para este servicio.'}
                </p>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Costo / Puntos</p>
                  <p className="text-xl font-black text-primary tracking-tighter">
                    Q {service.puntos_requeridos || 0}
                  </p>
                </div>
                <button 
                  onClick={() => handleRedeemClick(service)}
                  className="btn-primary px-6 h-11 text-xs"
                >
                  Pagar Ahora
                </button>
              </div>
            </div>
          ))}

          {services.length === 0 && (
            <div className="col-span-full py-20 bank-card border-dashed border-2 flex flex-col items-center justify-center text-center">
              <Gift className="w-12 h-12 text-text-secondary/20 mb-4" />
              <h3 className="text-xl font-bold text-text-primary">Catálogo Vacío</h3>
              <p className="text-text-secondary text-sm">No hay servicios disponibles en este momento.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de Canje */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-surface w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-border animate-in fade-in zoom-in duration-200">
            <div className="p-8 border-b border-border bg-primary-dark text-white relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black tracking-tighter mb-1">Confirmar Pago</h3>
              <p className="text-white/60 text-xs font-medium uppercase tracking-widest">{selectedService?.name}</p>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                <span className="text-sm font-bold text-text-secondary">Costo Total</span>
                <span className="text-xl font-black text-primary tracking-tighter">Q {selectedService?.points}</span>
              </div>

              <div>
                <label className="label-field">Seleccione Cuenta de Pago</label>
                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {accounts.map((acc) => (
                    <label key={acc._id} className={`
                      flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${selectedAccountId === acc._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20'}
                    `}>
                      <input 
                        type="radio" 
                        value={acc._id} 
                        className="hidden"
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        checked={selectedAccountId === acc._id}
                      />
                      <CreditCard className={`w-5 h-5 ${selectedAccountId === acc._id ? 'text-primary' : 'text-text-secondary'}`} />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-text-secondary leading-none mb-1">{acc.type}</p>
                        <p className="text-xs font-bold text-text-primary">{acc.accountNumber}</p>
                      </div>
                      <p className="text-xs font-black text-text-primary">Q {acc.balance?.toLocaleString()}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                  Esta operación descontará el monto indicado de su saldo disponible. No hay reversiones automáticas.
                </p>
              </div>

              <button
                disabled={serviceLoading}
                onClick={handleConfirmRedeem}
                className="btn-primary w-full h-14 flex items-center justify-center gap-2 group"
              >
                {serviceLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Finalizar y Pagar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};