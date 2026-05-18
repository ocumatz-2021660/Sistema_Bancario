import { useState, useRef, useEffect } from 'react';
import { useCurrencyStore, SUPPORTED_CURRENCIES } from '../store/useCurrencyStore';
import { ChevronDown, Loader2, RefreshCw } from 'lucide-react';

/**
 * CurrencyPicker — menú desplegable en el navbar para cambiar la divisa activa.
 * Al seleccionar, actualiza el store global y todos los useMoney() reaccionan.
 */
export const CurrencyPicker = () => {
  const { currency, symbol, isLoading, error, setCurrency, refreshRate } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const activeMeta = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = async (code) => {
    setOpen(false);
    await setCurrency(code);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface
                   hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold
                   text-text-primary"
        title="Cambiar divisa"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <span className="text-base leading-none">{activeMeta.flag}</span>
        )}
        <span className="hidden sm:inline">{currency}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border
                        rounded-2xl shadow-xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Seleccionar divisa
            </p>
            <button
              onClick={refreshRate}
              className="p-1 rounded-lg hover:bg-background text-text-secondary hover:text-primary transition-all"
              title="Actualizar tasa"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200">
              <p className="text-[10px] text-amber-700 font-semibold">{error}</p>
            </div>
          )}

          {/* Currency list */}
          <div className="max-h-72 overflow-y-auto py-2">
            {SUPPORTED_CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                  hover:bg-background
                  ${currency === c.code ? 'bg-primary/5' : ''}
                `}
              >
                <span className="text-xl leading-none w-7 text-center">{c.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${currency === c.code ? 'text-primary' : 'text-text-primary'}`}>
                    {c.code}
                    {currency === c.code && (
                      <span className="ml-2 text-[9px] font-black uppercase tracking-wider
                                       bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        activa
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-text-secondary truncate">{c.label}</p>
                </div>
                <span className="text-xs font-black text-text-secondary shrink-0">{c.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
