import { useEffect } from 'react';
import { useAdminStore } from '../store/useAdminStore';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  User, 
  Clock, 
  Wallet,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AccountRequestsPage = () => {
  const { requests, getAccountRequests, approveRequest, rejectRequest, isLoading, error } = useAdminStore();

  useEffect(() => {
    if (requests.length === 0 && !isLoading && !error) {
      getAccountRequests();
    }
  }, [getAccountRequests, requests.length, isLoading, error]);

  const handleAction = async (id, action, type) => {
    const operation = action === 'APPROVE' ? approveRequest : rejectRequest;
    const result = await operation(id);
    
    if (result.success) {
      toast.success(`Solicitud de cuenta ${type} ${action === 'APPROVE' ? 'aprobada' : 'rechazada'}`);
      getAccountRequests();
    } else {
      toast.error(result.error);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDIENTE');

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
          Solicitudes de <span className="text-primary">Cuenta</span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <FileText className="w-6 h-6 text-primary" />
          </span>
        </h1>
        <p className="text-text-secondary font-medium mt-2">Revisa y autoriza las nuevas solicitudes de productos financieros.</p>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Obteniendo solicitudes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingRequests.map((req) => (
            <div key={req._id} className="bank-card border-l-4 border-l-amber-500 flex flex-col lg:flex-row lg:items-center gap-8 p-8 hover:shadow-lg transition-all group">
              {/* Información del Usuario */}
              <div className="flex items-center gap-4 lg:w-1/4">
                <div className="w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest leading-none mb-1">Solicitante</p>
                  <p className="text-sm font-bold text-text-primary">{req.user?.name} {req.user?.surname}</p>
                  <p className="text-[10px] text-text-secondary font-medium italic">@{req.user?.username}</p>
                </div>
              </div>

              {/* Detalles de la Cuenta Solicitada */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1 border-y lg:border-y-0 lg:border-x border-border py-6 lg:py-0 lg:px-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest leading-none mb-2 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Tipo de Cuenta
                  </p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    req.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    {req.type}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest leading-none mb-2 flex items-center gap-1">
                    Q Saldo Inicial
                  </p>
                  <p className="text-lg font-black text-text-primary tracking-tighter">Q {req.initialBalance?.toLocaleString()}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest leading-none mb-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Fecha Solicitud
                  </p>
                  <p className="text-xs font-bold text-text-primary">
                    {format(new Date(req.createdAt), "dd 'de' MMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-4 shrink-0">
                <button 
                  onClick={() => handleAction(req._id, 'REJECT', req.type)}
                  className="flex-1 lg:flex-none px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 border-2 border-red-500/20 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar
                </button>
                <button 
                  onClick={() => handleAction(req._id, 'APPROVE', req.type)}
                  className="flex-1 lg:flex-none px-6 h-12 rounded-xl text-xs font-black uppercase tracking-widest bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar
                </button>
              </div>
            </div>
          ))}

          {pendingRequests.length === 0 && (
            <div className="py-32 flex flex-col items-center justify-center text-center bank-card border-dashed bg-transparent border-2">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                <Clock className="w-10 h-10 text-text-secondary/10" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Bandeja de entrada limpia</h3>
              <p className="text-text-secondary text-sm max-w-sm">
                No hay solicitudes de apertura de cuenta pendientes de procesar en este momento.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bank-card bg-amber-50 border-amber-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">Nota de Seguridad</h4>
            <p className="text-[11px] text-amber-700 leading-relaxed font-medium">
              Al aprobar una solicitud, el sistema generará automáticamente un número de cuenta único y vinculará el saldo inicial.
              Este proceso es irreversible desde esta consola; cualquier corrección posterior debe hacerse desde la gestión de cuentas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
