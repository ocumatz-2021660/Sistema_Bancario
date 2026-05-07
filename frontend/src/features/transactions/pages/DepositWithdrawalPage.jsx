import { useForm } from 'react-hook-form';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Wallet, 
  Loader2, 
  AlertCircle,
  Landmark
} from 'lucide-react';

export const DepositWithdrawalPage = () => {
  const [activeTab, setActiveTab] = useState('DEPOSIT'); // 'DEPOSIT' or 'WITHDRAW'
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const { accounts, getAccounts } = useAccountStore();
  const { deposit, withdraw, isLoading } = useTransactionStore();
  const { user } = useAuthStore();

  const selectedAccountId = watch('accountId');
  const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);

  useEffect(() => {
    getAccounts(user?.id);
  }, [getAccounts, user]);

  const onSubmit = async (data) => {
    const acc = accounts.find(a => a._id === data.accountId);
    const operation = activeTab === 'DEPOSIT' ? deposit : withdraw;
    const result = await operation({
      ...data,
      accountNumber: acc?.accountNumber
    });
    
    if (result.success) {
      toast.success(`${activeTab === 'DEPOSIT' ? 'Depósito' : 'Retiro'} realizado con éxito`);
      reset();
      getAccounts(user?.id);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-[800px] mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Depósitos y <span className="text-primary">Retiros</span> 🏧
          </h1>
          <p className="text-text-secondary font-medium mt-2">Gestiona el efectivo de tus cuentas institucionales.</p>
        </div>

        <div className="inline-flex p-1 bg-surface border border-border rounded-2xl shadow-sm">
          <button
            onClick={() => { setActiveTab('DEPOSIT'); reset(); }}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'DEPOSIT' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-primary'
            }`}
          >
            Depósito
          </button>
          <button
            onClick={() => { setActiveTab('WITHDRAW'); reset(); }}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'WITHDRAW' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:text-primary'
            }`}
          >
            Retiro
          </button>
        </div>
      </header>

      <div className="bank-card shadow-xl border-t-4 border-t-primary">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Selección de Cuenta */}
          <div>
            <label className="label-field">Seleccione la Cuenta</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <label key={acc._id} className={`
                  relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedAccountId === acc._id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                `}>
                  <input 
                    type="radio" 
                    value={acc._id} 
                    className="hidden"
                    {...register('accountId', { required: 'Seleccione una cuenta' })}
                  />
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {activeTab === 'DEPOSIT' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-text-secondary tracking-tighter">{acc.type} - {acc.accountNumber}</p>
                    <p className="text-xs font-bold text-text-primary">Q {acc.balance?.toLocaleString()}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.accountId && <span className="text-[10px] text-red-500 font-bold uppercase mt-2 block">{errors.accountId.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monto */}
            <div>
              <label className="label-field">Monto de la Operación</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary font-bold">
                  Q
                </div>
                <input
                  {...register('amount', { 
                    required: 'Requerido',
                    min: { value: 1, message: 'Mínimo Q 1' },
                    validate: value => activeTab === 'DEPOSIT' || !selectedAccount || value <= selectedAccount.balance || 'Saldo insuficiente'
                  })}
                  type="number"
                  step="0.01"
                  className="input-field pl-10"
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <span className="text-[10px] text-red-500 font-bold uppercase mt-1 block">{errors.amount.message}</span>}
            </div>

            {/* Ubicación / Referencia (Opcional) */}
            <div>
              <label className="label-field">Referencia de Caja / ATM</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Landmark className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  {...register('reference')}
                  type="text"
                  className="input-field pl-12"
                  placeholder="Ej. ATM Agencia Central"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-3 flex-1">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                Esta es una operación de simulación digital. En un entorno real, debe presentarse en ventanilla con su DPI.
              </p>
            </div>
            
            <button
              disabled={isLoading}
              type="submit"
              className="btn-primary px-12 h-14 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {activeTab === 'DEPOSIT' ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                  Confirmar {activeTab === 'DEPOSIT' ? 'Depósito' : 'Retiro'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
