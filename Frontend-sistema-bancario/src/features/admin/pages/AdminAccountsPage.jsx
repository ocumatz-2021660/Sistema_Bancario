import { useEffect, useState } from 'react';
import { useMoney } from '../../../shared/hooks/useMoney';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { toast } from 'react-hot-toast';
import {
  Wallet, Search, Edit2, Trash2, Loader2, DollarSign, X
} from 'lucide-react';

export const AdminAccountsPage = () => {
  const { accounts, getAllAccounts, updateSaldo, activateAccount, deactivateAccount, deleteAccount, isLoading } = useAccountStore();
  const { format } = useMoney();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAccount, setEditingAccount] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => { getAllAccounts(); }, [getAllAccounts]);

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

  const handleToggleStatus = async (acc) => {
    if (acc.status) {
      if (!confirm('¿Seguro que desea desactivar esta cuenta?')) return;
      const result = await deactivateAccount(acc._id);
      if (result.success) toast.success('Cuenta desactivada');
      else toast.error(result.error || 'No se pudo desactivar');
    } else {
      const result = await activateAccount(acc._id);
      if (result.success) toast.success('Cuenta activada');
      else toast.error(result.error || 'No se pudo activar');
    }
  };

  const handleDelete = async (acc) => {
    if (!confirm('¿ESTÁ SEGURO? Esta acción eliminará permanentemente la cuenta.')) return;
    const result = await deleteAccount(acc._id);
    if (result.success) toast.success('Cuenta eliminada');
    else toast.error(result.error || 'No se pudo eliminar');
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
          <h1 className="text-4xl font-black text-text-primary tracking-tighter flex items-center gap-3">
            Control de <span className="text-primary">Cuentas</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Wallet className="w-6 h-6 text-primary" />
            </span>
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
        <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ background: 'linear-gradient(90deg, #d1fae5 0%, #bbf7d0 100%)' }}>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600">No. Cuenta</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Usuario</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Contacto</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Saldo</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600">Estado</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 text-center">Modificar Estado</th>
                <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-600 text-right">Funciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredAccounts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-20 text-center text-sm font-bold text-text-secondary uppercase tracking-widest">
                    No se encontraron cuentas
                  </td>
                </tr>
              )}

              {filteredAccounts.map((acc, idx) => (
                <>
                  {idx !== 0 && (
                    <tr key={`sep-${acc._id}`} style={{ height: 8, background: '#f3f4f6' }}>
                      <td colSpan="7" />
                    </tr>
                  )}

                  <tr
                    key={acc._id}
                    style={{ background: '#ffffff' }}
                    className="transition-colors hover:bg-emerald-50/40 group"
                  >
                    {/* No. Cuenta */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-black text-text-primary tracking-tight">{acc.accountNumber}</p>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.06em',
                        color: acc.type === 'AHORRO' ? '#15803d' : '#1d4ed8',
                      }}>
                        {acc.type}
                      </span>
                    </td>

                    {/* Usuario */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-text-primary">{acc.user?.name} {acc.user?.surname}</p>
                      <p className="text-[11px] text-text-secondary">@{acc.user?.username}</p>
                    </td>

                    {/* Contacto */}
                    <td className="px-5 py-4">
                      <p className="text-xs text-text-secondary">{acc.user?.email}</p>
                    </td>

                    {/* Saldo */}
                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-text-primary tracking-tight">{format(acc.balance)}</span>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      <span style={{ display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 800,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        background: acc.status ? '#dcfce7' : '#fee2e2',
                        color: acc.status ? '#15803d' : '#b91c1c',
                      }}>
                        <span style={{
                          width: 6, height: 6,
                          borderRadius: '50%',
                          background: acc.status ? '#16a34a' : '#dc2626',
                          display: 'inline-block'
                        }} />
                        {acc.status ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    {/* Checkbox */}
                    <td className="px-5 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={acc.status}
                        onChange={() => handleToggleStatus(acc)}
                        style={{
                          width: 16,
                          height: 16,
                          cursor: 'pointer',
                          accentColor: '#16a34a',
                        }}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setEditingAccount(acc); setNewBalance(acc.balance); }}
                          title="Editar saldo"
                          style={{
                            padding: '7px',
                            borderRadius: 10,
                            border: '1.5px solid #e5e7eb',
                            background: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            color: '#6b7280',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc)}
                          title="Eliminar cuenta"
                          style={{
                            padding: '7px',
                            borderRadius: 10,
                            border: '1.5px solid #e5e7eb',
                            background: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.18s',
                            color: '#6b7280',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#ef4444'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
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
              <button onClick={handleUpdateBalance} className="btn-primary w-full h-14 flex items-center justify-center gap-2">
                Actualizar Fondos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};