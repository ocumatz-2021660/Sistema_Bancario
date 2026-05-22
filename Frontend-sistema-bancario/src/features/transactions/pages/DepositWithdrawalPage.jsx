import { useForm } from 'react-hook-form';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useEffect, useState } from 'react';
import { useMoney } from '../../../shared/hooks/useMoney';
import { toast } from 'react-hot-toast';
import { useCurrencyStore } from '../../../shared/store/useCurrencyStore';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Loader2,
  Landmark,
  Banknote,
  Search,
  X
} from 'lucide-react';

export const DepositWithdrawalPage = () => {
  const { user, role } = useAuthStore();
  const isAdmin = role === 'ADMIN_ROLE';
  const { format } = useMoney();
  const { rate, symbol} = useCurrencyStore();

  const [activeTab, setActiveTab] = useState(isAdmin ? 'DEPOSIT' : 'WITHDRAW');
  const [accountSearch, setAccountSearch] = useState('');
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const { accounts, getAccounts, getAllAccounts } = useAccountStore();
  const { deposit, withdraw, isLoading } = useTransactionStore();

  const selectedAccountId = watch('accountId');
  const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);

  useEffect(() => {
    if (isAdmin) {
      getAllAccounts();
    } else {
      getAccounts(user?.id);
    }
  }, [isAdmin, getAllAccounts, getAccounts, user]);

  const filteredAccounts = isAdmin && accountSearch.trim()
    ? accounts.filter(acc => acc.accountNumber?.includes(accountSearch.trim()))
    : accounts;

  const onSubmit = async (data) => {
    const acc = accounts.find(a => a._id === data.accountId);
    const amountInGTQ = parseFloat(data.amount) / rate;
    const operation = activeTab === 'DEPOSIT' ? deposit : withdraw;
    const result = await operation({
      ...data,
      amount: amountInGTQ,
      accountNumber: acc?.accountNumber
    });

    if (result.success) {
      toast.success(`${activeTab === 'DEPOSIT' ? 'Depósito' : 'Retiro'} realizado con éxito`);
      reset();
      setAccountSearch('');
      if (isAdmin) {
        getAllAccounts();
      } else {
        getAccounts(user?.id, { force: true });
      }
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-200 mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            {isAdmin ? (
              <><span className="text-primary">Depósitos</span></>
            ) : (
              <span className="text-primary">Retiros</span>
            )}
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10"><Banknote className="w-6 h-6 text-primary" /></span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">{isAdmin ? 'Realiza depósitos a cualquier cuenta del sistema.' : 'Gestiona el efectivo de tus cuentas institucionales.'}</p>
        </div>

      </header>

      <div className="bank-card shadow-xl border-t-4 border-t-primary">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Selección de Cuenta */}
          <div>
            <label className="label-field">Seleccione la Cuenta</label>

            {/* Search */}
            {isAdmin && (
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-text-secondary" />
                </div>
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  className="input-field pl-11 pr-10"
                  placeholder="Buscar por número de cuenta..."
                />
                {accountSearch && (
                  <button
                    type="button"
                    onClick={() => setAccountSearch('')}
                    className="absolute inset-y-0 right-3 flex items-center text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAccounts.map((acc) => (
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
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === 'DEPOSIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {activeTab === 'DEPOSIT' ? <ArrowUpCircle className="w-5 h-5" /> : <ArrowDownCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-text-secondary tracking-tighter">{acc.type} - {acc.accountNumber}</p>
                    <p className="text-xs font-bold text-text-primary">{format(acc.balance)}</p>
                  </div>
                </label>
              ))}
            </div>

            {isAdmin && accountSearch && filteredAccounts.length === 0 && (
              <p className="text-center text-sm text-text-secondary font-medium py-6">
                No se encontró ninguna cuenta con el número <span className="font-black text-text-primary">"{accountSearch}"</span>
              </p>
            )}

            {errors.accountId && <span className="text-[10px] text-red-500 font-bold uppercase mt-2 block">{errors.accountId.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monto */}
            <div>
              <label className="label-field">Monto de la Operación</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-secondary font-bold">
                  {symbol}
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

          <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
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
