import { useEffect, useState } from 'react';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { useAdminStore } from '../store/useAdminStore';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  Search, 
  Edit2, 
  Trash2, 
  Ban, 
  CheckCircle2, 
  Loader2,
  User,
  DollarSign,
  X
} from 'lucide-react';

export const AdminAccountsPage = () => {
  const { accounts, getAllAccounts, updateSaldo, deactivateAccount, deleteAccount, isLoading } = useAccountStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    getAllAccounts();
  }, [getAllAccounts]);

  const handleUpdateBalance = async () => {
    if (!newBalance || isNaN(newBalance)) return toast.error('Ingrese un monto válido');
    
    const result = await updateSaldo(editingAccount._id, parseFloat(newBalance));
    if (result.success) {
      toast.success('Saldo actualizado correctamente');
      setEditingAccount(null);
      getAllAccounts();
    } else {
      toast.error(result.error);
    }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('¿Seguro que desea cambiar el estado de esta cuenta?')) return;
    const result = await deactivateAccount(id);
    if (result.success) {
      toast.success('Estado actualizado');
      getAllAccounts();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿ESTÁ SEGURO? Esta acción eliminará permanentemente la cuenta y todo su historial.')) return;
    const result = await deleteAccount(id);
    if (result.success) {
      toast.success('Cuenta eliminada');
      getAllAccounts();
    } else {
      toast.error(result.error);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.accountNumber?.includes(searchTerm) || 
    acc.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Control de <span className="text-primary">Cuentas</span> 💰
          </h1>
          <p className="text-text-secondary font-medium mt-2">Monitoreo y gestión de todos los activos financieros del banco.</p>
        </div>

        <div className="relative group w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="No. Cuenta o Usuario..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12 h-12"
          />
        </div>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Accediendo a las bóvedas...</p>
        </div>
      ) : (
        <div className="bank-card p-0 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-border">
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Número de Cuenta</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Titular</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Tipo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Saldo</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="hover:bg-primary/5 transition-colors group">
                    <td className="px-6 py-5 font-black text-text-primary tracking-tighter">
                      {acc.accountNumber}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-text-primary">{acc.user?.name} {acc.user?.surname}</p>
                          <p className="text-[10px] text-text-secondary">@{acc.user?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        acc.type === 'AHORRO' ? 'bg-primary/10 text-primary' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {acc.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-text-primary tracking-tighter">
                      Q {acc.balance?.toLocaleString()}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        acc.status ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {acc.status ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingAccount(acc); setNewBalance(acc.balance); }}
                          className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeactivate(acc._id)}
                          className={`p-2 rounded-lg transition-all ${
                            acc.status 
                            ? 'text-text-secondary hover:text-red-500 hover:bg-red-50' 
                            : 'text-text-secondary hover:text-green-500 hover:bg-green-50'
                          }`}
                        >
                          {acc.status ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => handleDelete(acc._id)}
                          className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Editar Saldo */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setEditingAccount(null)} />
          <div className="bg-surface w-full max-w-sm rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-border">
            <div className="p-8 border-b border-border bg-primary-dark text-white relative">
              <button onClick={() => setEditingAccount(null)} className="absolute top-6 right-6 text-white/60 hover:text-white">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-black tracking-tighter">Editar Saldo</h3>
              <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mt-1">Cuenta: {editingAccount.accountNumber}</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="label-field">Nuevo Saldo (Q)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <input 
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="input-field pl-12 font-black text-lg"
                  />
                </div>
              </div>
              <button 
                onClick={handleUpdateBalance}
                className="btn-primary w-full h-14 flex items-center justify-center gap-2"
              >
                Actualizar Fondos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
