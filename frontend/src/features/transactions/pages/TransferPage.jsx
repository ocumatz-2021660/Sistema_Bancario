import { useForm } from 'react-hook-form';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Send, 
  ArrowRight, 
  Wallet, 
  User, 
  MessageSquare, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  ArrowLeftRight
} from 'lucide-react';

export const TransferPage = () => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const { accounts, getAccounts } = useAccountStore();
  const { transfer, isLoading } = useTransactionStore();
  const { user } = useAuthStore();

  const sourceAccount = watch('sourceAccount');
  const amount = watch('amount');

  useEffect(() => {
    getAccounts(user?.id);
  }, [getAccounts, user]);

  // Encontrar la cuenta seleccionada para mostrar su saldo disponible
  const selectedAccount = accounts.find(acc => acc._id === sourceAccount);

  const onSubmit = async (data) => {
    // Necesitamos el número de cuenta real, no el ID
    const sourceAcc = accounts.find(acc => acc._id === data.sourceAccount);
    const result = await transfer({
      ...data,
      sourceAccountNumber: sourceAcc?.accountNumber
    });
    
    if (result.success) {
      toast.success('¡Transferencia exitosa!');
      reset();
      getAccounts(user?.id); // Actualizar saldos
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter">
          Transferir <span className="text-primary">Fondos</span>
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"><ArrowLeftRight className="w-6 h-6 text-primary" /></span>
        </h1>
        <p className="text-text-secondary font-medium mt-2">Mueve dinero de forma segura a cualquier cuenta.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bank-card shadow-xl border-t-4 border-t-primary">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Cuenta Origen */}
              <div>
                <label className="label-field">Cuenta de Origen</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((acc) => (
                    <label key={acc._id} className={`
                      relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${sourceAccount === acc._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                    `}>
                      <input 
                        type="radio" 
                        value={acc._id} 
                        className="hidden"
                        {...register('sourceAccount', { required: 'Seleccione cuenta origen' })}
                      />
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-black uppercase text-text-secondary tracking-tighter truncate">{acc.type} - {acc.accountNumber}</p>
                        <p className="text-xs font-bold text-text-primary truncate">Q {acc.balance?.toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.sourceAccount && <span className="text-[10px] text-red-500 font-bold uppercase mt-2 block">{errors.sourceAccount.message}</span>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cuenta Destino */}
                <div>
                  <label className="label-field">Cuenta de Destino</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <User className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      {...register('destinationAccount', { required: 'Requerido' })}
                      type="text"
                      className="input-field pl-12"
                      placeholder="No. de cuenta destino"
                    />
                  </div>
                  {errors.destinationAccount && <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">{errors.destinationAccount.message}</span>}
                </div>

                {/* Monto */}
                <div>
                  <label className="label-field">Monto a Transferir</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary font-bold">
                      Q
                    </div>
                    <input
                      {...register('amount', { 
                        required: 'Requerido',
                        min: { value: 1, message: 'Mínimo Q 1' },
                        validate: value => !selectedAccount || value <= selectedAccount.balance || 'Saldo insuficiente'
                      })}
                      type="number"
                      step="0.01"
                      className="input-field pl-10"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">{errors.amount.message}</span>}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="label-field">Descripción (Opcional)</label>
                <div className="relative group">
                  <div className="absolute top-4 left-4 pointer-events-none">
                    <MessageSquare className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                  </div>
                  <textarea
                    {...register('description')}
                    rows="3"
                    className="input-field pl-12 pt-3 resize-none"
                    placeholder="Ej. Pago de alquiler..."
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border flex items-center justify-between gap-4">
                <div className="hidden md:block">
                  <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Resumen de operación</p>
                  <p className="text-sm font-bold text-text-primary">
                    {amount ? `Transfiriendo Q ${parseFloat(amount).toLocaleString()}` : 'Complete los datos'}
                  </p>
                </div>
                
                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn-primary flex-1 md:flex-none px-12 h-14 flex items-center justify-center gap-2 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Confirmar Transferencia
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bank-card bg-primary-dark text-white border-none relative overflow-hidden">
            <div className="absolute -bottom-6 -right-6 opacity-10">
              <CheckCircle2 className="w-32 h-32" />
            </div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-6">Consejos de Seguridad</h4>
            <ul className="space-y-4 relative z-10">
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-primary-light rounded-full mt-1.5 shrink-0" />
                <p className="text-[11px] text-white/70 leading-relaxed">Verifique siempre el número de cuenta destino antes de confirmar.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-primary-light rounded-full mt-1.5 shrink-0" />
                <p className="text-[11px] text-white/70 leading-relaxed">Las transferencias a cuentas del mismo banco son inmediatas.</p>
              </li>
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 bg-primary-light rounded-full mt-1.5 shrink-0" />
                <p className="text-[11px] text-white/70 leading-relaxed">Nunca comparta su clave de seguridad por teléfono o correo.</p>
              </li>
            </ul>
          </div>

          <div className="bank-card border-blue-100 bg-blue-50/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-blue-700 uppercase tracking-tight mb-1">Favoritos</h4>
                <p className="text-[10px] text-blue-600 leading-relaxed font-medium">
                  Puede guardar esta cuenta en sus favoritos después de realizar la transferencia para agilizar futuros pagos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
