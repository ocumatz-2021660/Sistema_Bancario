import { useEffect, useState } from 'react';
import { useMoney } from '../../../shared/hooks/useMoney';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useTransactionStore } from '../store/useTransactionStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  History,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Loader2,
  FileText,
  Filter,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-hot-toast';

export const TransactionHistoryPage = () => {
  const { accounts, getAccounts, isLoading: accountsLoading, error: accountsError } = useAccountStore();
  const { format: formatMoney } = useMoney();
  const { history, getHistory, isLoading, deleteTransaction } = useTransactionStore();
  const { user } = useAuthStore();
  const [selectedAccountId, setSelectedAccountId] = useState('');

  useEffect(() => {
    if (accounts.length === 0 && !accountsLoading && !accountsError) {
      getAccounts(user?.id);
    }
  }, [getAccounts, user, accounts.length, accountsLoading, accountsError]);

  useEffect(() => {
    if (selectedAccountId) {
      getHistory(selectedAccountId);
    }
  }, [selectedAccountId, getHistory]);

  const selectedAccount = accounts.find(acc => acc._id === selectedAccountId);

  const isIncoming = (tx) => {
    if (tx.type === 'DEPOSITO') return true;
    if (tx.type === 'TRANSFERENCIA') {
      return tx.destinationAccount === selectedAccount?.accountNumber;
    }
    return false;
  };
  const handleDelete = async (transacciones_id) => {
    if (!confirm('¿Deseas cancelar este pago de servicio?')) return;
    const result = await deleteTransaction(transacciones_id, selectedAccountId);
    if (result.success) {
      toast.success('Transacción cancelada y saldo actualizado');
      getAccounts(user?.id);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Historial de <span className="text-primary">Movimientos</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 ml-3">
              <History className="w-6 h-6 text-primary" />
            </span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">Consulta el rastro de tus finanzas en tiempo real.</p>
        </div>

        <div className="flex items-center gap-3">
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
                  {acc.accountNumber} — {acc.type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-text-secondary">
              <Filter className="w-4 h-4" />
            </div>
          </div>
          {selectedAccountId && (
            <button
              onClick={() => getHistory(selectedAccountId)}
              className="p-3 bg-surface border border-border rounded-xl text-text-secondary hover:text-primary hover:border-primary transition-all"
              title="Actualizar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {!selectedAccountId ? (
        <div className="py-32 flex flex-col items-center justify-center text-center bank-card border-dashed bg-transparent border-2">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
            <History className="w-10 h-10 text-text-secondary/20" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Seleccione una cuenta para comenzar</h3>
          <p className="text-text-secondary text-sm max-w-sm">
            Para visualizar los movimientos, elija una de sus cuentas activas desde el menú superior.
          </p>
        </div>
      ) : isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Sincronizando movimientos...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Resumen de la Cuenta */}
          <div className="bank-card bg-primary-dark text-white border-none flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">Cuenta Seleccionada</p>
              <h3 className="text-2xl font-black tracking-tighter">No. {selectedAccount?.accountNumber}</h3>
              <p className="text-sm text-white/70 font-medium mt-1">{selectedAccount?.alias || selectedAccount?.type || 'Cuenta Personal'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">Saldo Disponible</p>
              <h3 className="text-4xl font-black tracking-tighter text-primary-light">
                {formatMoney(selectedAccount?.balance)}
              </h3>
            </div>
          </div>

          {/* devuelve las últimas 5 transacciones */}
          {history.length > 0 && (
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest text-right">
              Mostrando los últimos {history.length} movimiento{history.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Tabla de Movimientos */}
          <div className="bank-card p-0 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Fecha y Hora</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Tipo</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Detalle</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Monto</th>
                    <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">x</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((tx) => {
                    const incoming = isIncoming(tx);
                    return (
                      <tr key={tx._id} className="hover:bg-primary/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-background border border-border rounded-lg text-text-secondary">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">
                                {format(new Date(tx.createdAt), "dd 'de' MMMM", { locale: es })}
                              </p>
                              <p className="text-[10px] text-text-secondary font-medium">
                                {format(new Date(tx.createdAt), "hh:mm a")}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${incoming ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                            }`}>
                            {incoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {tx.type === 'TRANSFERENCIA' && (
                            <p className="text-xs font-medium text-text-secondary">
                              {incoming
                                ? `Desde: ${tx.sourceAccount || '—'}`
                                : `Hacia: ${tx.destinationAccount || '—'}`}
                            </p>
                          )}
                          {tx.type === 'DEPOSITO' && (
                            <p className="text-xs font-medium text-text-secondary">Depósito en efectivo</p>
                          )}
                          {tx.description && (
                            <p className="text-xs text-text-secondary/60 mt-0.5 truncate max-w-[220px]">{tx.description}</p>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right font-black tracking-tighter">
                          <span className={incoming ? 'text-green-500' : 'text-red-500'}>
                            {incoming ? '+' : '-'}{formatMoney(tx.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black tracking-tighter">
                          {/* Solo mostrar el botón si NO es una transacción recibida (incoming) */}
                          {!incoming && (
                            <button
                              onClick={() => handleDelete(tx._id)}
                              className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {incoming && (
                            <span className="text-[9px] text-text-secondary/40 italic">No cancelable</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {history.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <FileText className="w-12 h-12 text-text-secondary/20 mb-4" />
                          <p className="text-sm font-bold text-text-secondary uppercase tracking-widest">No hay movimientos registrados</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
