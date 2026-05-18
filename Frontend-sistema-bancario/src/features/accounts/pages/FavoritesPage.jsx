import { useEffect, useState } from 'react';
import { useAccountStore } from '../store/useAccountStore';
import { toast } from 'react-hot-toast';
import { 
  Star, 
  Send, 
  Trash2, 
  Loader2,
  PlusCircle,
  X,
  Hash,
  Tag as TagIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  const { favorites, getFavorites, addFavorite, deleteFavorite, isLoading } = useAccountStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getFavorites();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newAccountNumber.trim() || !newAlias.trim()) return;
    setAdding(true);
    const result = await addFavorite(newAccountNumber.trim(), newAlias.trim());
    setAdding(false);
    if (result.success) {
      toast.success('Favorito agregado exitosamente');
      setShowAddForm(false);
      setNewAccountNumber('');
      setNewAlias('');
      getFavorites();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id, alias) => {
    const result = await deleteFavorite(id);
    if (result.success) {
      toast.success(`"${alias}" eliminado de favoritos`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-text-primary tracking-tighter">
            Cuentas <span className="text-primary">Favoritas</span>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 ml-3">
              <Star className="w-6 h-6 text-primary" />
            </span>
          </h1>
          <p className="text-text-secondary font-medium mt-2">Gestiona tus contactos frecuentes para transferencias rápidas.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2 h-12"
        >
          <PlusCircle className="w-5 h-5" />
          Agregar Favorito
        </button>
      </header>

      {/* Modal / Form para agregar */}
      {showAddForm && (
        <div className="bank-card border-t-4 border-t-primary shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Nueva Cuenta Favorita</h3>
            <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label-field">Número de Cuenta</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Hash className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={newAccountNumber}
                  onChange={(e) => setNewAccountNumber(e.target.value)}
                  placeholder="Ej. 2491903918"
                  className="input-field pl-12"
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label-field">Alias / Nombre</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <TagIcon className="w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ej. Cuenta de mamá"
                  className="input-field pl-12"
                  maxLength={50}
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-4 pt-2 border-t border-border">
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary h-12 px-6">
                Cancelar
              </button>
              <button type="submit" disabled={adding} className="btn-primary h-12 px-8 flex items-center gap-2">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Guardar Favorito
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Cargando tus favoritos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav._id} className="bank-card group hover:border-primary/30 transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <button
                  onClick={() => handleDelete(fav._id, fav.alias_favorito)}
                  className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Eliminar favorito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-1">{fav.alias_favorito || 'Sin Alias'}</h3>
              <p className="text-xs font-black text-primary tracking-tighter mb-6">{fav.no_cuenta}</p>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Transferencia rápida</p>
                <Link
                  to="/dashboard/transfer"
                  state={{ destinationAccount: fav.no_cuenta }}
                  className="flex items-center gap-2 text-xs font-black text-primary hover:text-primary-dark transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Transferir
                </Link>
              </div>
            </div>
          ))}

          {favorites.length === 0 && !showAddForm && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bank-card border-dashed border-2">
              <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-text-secondary/20" />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Sin favoritos aún</h3>
              <p className="text-text-secondary text-sm mb-6 max-w-sm">
                Agrega cuentas de uso frecuente para agilizar tus transferencias.
              </p>
              <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                Agregar mi primer favorito
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
