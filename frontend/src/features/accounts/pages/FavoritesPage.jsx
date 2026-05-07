import { useEffect } from 'react';
import { useAccountStore } from '../../accounts/store/useAccountStore';
import { 
  Star, 
  User, 
  Send, 
  Trash2, 
  Loader2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FavoritesPage = () => {
  const { favorites, searchFavorites, isLoading } = useAccountStore();

  useEffect(() => {
    searchFavorites();
  }, [searchFavorites]);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-4xl font-black text-text-primary tracking-tighter">
          Cuentas <span className="text-primary">Favoritas</span> ⭐
        </h1>
        <p className="text-text-secondary font-medium mt-2">Gestiona tus contactos frecuentes para transferencias rápidas.</p>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-text-secondary font-bold uppercase tracking-widest text-xs">Cargando tus favoritos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav._id} className="bank-card group hover:border-primary transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 fill-amber-500" />
                </div>
                <button className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-text-primary mb-1">{fav.alias || 'Sin Alias'}</h3>
              <p className="text-xs font-black text-primary tracking-tighter mb-6">{fav.accountNumber}</p>
              
              <div className="flex items-center gap-3 pt-6 border-t border-border">
                <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
                  <User className="w-4 h-4" />
                </div>
                <p className="text-[10px] font-bold text-text-secondary uppercase truncate">
                  {fav.ownerName || 'Titular de la cuenta'}
                </p>
              </div>

              <Link 
                to="/dashboard/transfer" 
                state={{ destinationAccount: fav.accountNumber }}
                className="absolute top-6 right-12 p-2 text-text-secondary hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              >
                <Send className="w-4 h-4" />
              </Link>
            </div>
          ))}

          <div className="bank-card border-dashed border-2 flex flex-col items-center justify-center text-center py-12 group cursor-pointer hover:bg-primary/5 transition-all">
            <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Star className="w-6 h-6 text-text-secondary/20" />
            </div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight">Agregar Favorito</h4>
            <p className="text-[10px] text-text-secondary mt-1 px-8">
              Puedes agregar favoritos directamente al realizar una transferencia exitosa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
