import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAccountStore } from '../store/useAccountStore';
import { toast } from 'react-hot-toast';
import { 
  PlusCircle, 
  ArrowLeft, 
  Landmark, 
  Coins, 
  Tag, 
  Loader2, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const CreateAccountPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      type: 'MONETARIA',
      balance: 100
    }
  });
  const { createAccountRequest, isLoading } = useAccountStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await createAccountRequest(data);
    
    if (result.success) {
      toast.success('Solicitud enviada correctamente. Pendiente de aprobación.');
      navigate('/dashboard/accounts');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10">
      <header className="flex items-center gap-4">
        <Link 
          to="/dashboard/accounts" 
          className="w-10 h-10 bg-surface border border-border rounded-xl flex items-center justify-center text-text-secondary hover:text-primary transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase leading-none">
            Nueva <span className="text-primary">Cuenta</span>
          </h1>
          <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
            Solicitud de apertura de producto financiero
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bank-card shadow-xl border-t-4 border-t-primary">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="label-field">Tipo de Cuenta</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${errors.type ? 'border-red-200' : 'border-border'}
                      hover:border-primary/30
                      has-[:checked]:border-primary has-[:checked]:bg-primary/5
                    `}>
                      <input 
                        type="radio" 
                        value="MONETARIA" 
                        className="hidden"
                        {...register('type', { required: 'Seleccione un tipo' })}
                      />
                      <Landmark className="w-6 h-6 text-text-secondary mb-2" />
                      <span className="text-xs font-black uppercase tracking-wider text-text-primary">Monetaria</span>
                      <span className="text-[10px] text-text-secondary mt-1 text-center">Para uso diario y transferencias</span>
                    </label>

                    <label className={`
                      relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${errors.type ? 'border-red-200' : 'border-border'}
                      hover:border-primary/30
                      has-[:checked]:border-primary has-[:checked]:bg-primary/5
                    `}>
                      <input 
                        type="radio" 
                        value="AHORRO" 
                        className="hidden"
                        {...register('type', { required: 'Seleccione un tipo' })}
                      />
                      <Coins className="w-6 h-6 text-text-secondary mb-2" />
                      <span className="text-xs font-black uppercase tracking-wider text-text-primary">Ahorro</span>
                      <span className="text-[10px] text-text-secondary mt-1 text-center">Genera intereses trimestrales</span>
                    </label>
                  </div>
                  {errors.type && <span className="text-[10px] text-red-500 font-bold uppercase mt-2 block">{errors.type.message}</span>}
                </div>

                <div>
                  <label className="label-field">Saldo Inicial (Mín. Q 100)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary font-bold">
                      Q
                    </div>
                    <input
                      {...register('balance', { 
                        required: 'Requerido',
                        min: { value: 100, message: 'Mínimo Q 100' }
                      })}
                      type="number"
                      className="input-field pl-10"
                      placeholder="100"
                    />
                  </div>
                  {errors.balance && <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">{errors.balance.message}</span>}
                </div>

                <div>
                  <label className="label-field">Alias de la Cuenta (Opcional)</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Tag className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                      {...register('alias')}
                      type="text"
                      className="input-field pl-12"
                      placeholder="Ej. Ahorros Universidad"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <button
                  disabled={isLoading}
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2 h-14 group"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Enviar Solicitud de Apertura
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bank-card bg-primary-dark text-white border-none">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary-light" />
              Requisitos
            </h4>
            <ul className="space-y-3 text-xs text-white/70 font-medium">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary-light rounded-full mt-1.5 shrink-0" />
                DPI vigente y escaneado
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary-light rounded-full mt-1.5 shrink-0" />
                Recibo de servicios (Agua/Luz)
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 bg-primary-light rounded-full mt-1.5 shrink-0" />
                Monto mínimo de Q 100.00
              </li>
            </ul>
          </div>

          <div className="bank-card border-amber-200 bg-amber-50/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-black text-amber-700 uppercase tracking-tight mb-1">Nota importante</h4>
                <p className="text-[11px] text-amber-600 leading-relaxed font-medium">
                  Toda solicitud de cuenta nueva está sujeta a revisión por nuestro departamento de riesgos. El proceso puede demorar hasta 24 horas hábiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
