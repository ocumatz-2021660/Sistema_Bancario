import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const SUPPORTED_CURRENCIES = [
  { code: 'GTQ', label: 'Quetzal guatemalteco',  flag: '🇬🇹', symbol: 'Q'  },
  { code: 'USD', label: 'Dólar estadounidense',  flag: '🇺🇸', symbol: '$'  },
  { code: 'EUR', label: 'Euro',                  flag: '🇪🇺', symbol: '€'  },
  { code: 'GBP', label: 'Libra esterlina',       flag: '🇬🇧', symbol: '£'  },
  { code: 'CAD', label: 'Dólar canadiense',      flag: '🇨🇦', symbol: '$'  },
  { code: 'AUD', label: 'Dólar australiano',     flag: '🇦🇺', symbol: '$'  },
  { code: 'CHF', label: 'Franco suizo',          flag: '🇨🇭', symbol: 'Fr' },
  { code: 'JPY', label: 'Yen japonés',           flag: '🇯🇵', symbol: '¥'  },
  { code: 'CNY', label: 'Yuan chino',            flag: '🇨🇳', symbol: '¥'  },
  { code: 'KRW', label: 'Won surcoreano',        flag: '🇰🇷', symbol: '₩'  },
  { code: 'MXN', label: 'Peso mexicano',         flag: '🇲🇽', symbol: '$'  },
  { code: 'COP', label: 'Peso colombiano',       flag: '🇨🇴', symbol: '$'  },
  { code: 'BRL', label: 'Real brasileño',        flag: '🇧🇷', symbol: 'R$' },
  { code: 'ARS', label: 'Peso argentino',        flag: '🇦🇷', symbol: '$'  },
  { code: 'CLP', label: 'Peso chileno',          flag: '🇨🇱', symbol: '$'  },
  { code: 'PEN', label: 'Sol peruano',           flag: '🇵🇪', symbol: 'S/' },
  { code: 'HNL', label: 'Lempira hondureño',    flag: '🇭🇳', symbol: 'L'  },
  { code: 'NIO', label: 'Córdoba nicaragüense', flag: '🇳🇮', symbol: 'C$' },
  { code: 'CRC', label: 'Colón costarricense',  flag: '🇨🇷', symbol: '₡'  },
  { code: 'DOP', label: 'Peso dominicano',       flag: '🇩🇴', symbol: '$'  },
];

export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      currency: 'GTQ',
      rate: 1,
      symbol: 'Q',
      isLoading: false,
      error: null,

      setCurrency: async (code) => {
        const meta = SUPPORTED_CURRENCIES.find(c => c.code === code);
        if (!meta) return;

        if (code === 'GTQ') {
          set({ currency: 'GTQ', rate: 1, symbol: 'Q', error: null });
          return;
        }

        if (code === get().currency) return;

        set({ isLoading: true, error: null });
        try {
          const res = await api.get('/currency/rate', { params: { to: code } });
          const rate = res.data?.data?.rate;

          if (rate) {
            set({ currency: code, rate: parseFloat(rate), symbol: meta.symbol, isLoading: false });
          } else {
            set({ isLoading: false, error: 'Tasa no disponible' });
          }
        } catch (err) {
          set({ isLoading: false, error: 'Error al obtener tasa de cambio' });
        }
      },

      refreshRate: async () => {
        const code = get().currency;
        if (code === 'GTQ') return;
        const prev = code;
        set({ currency: 'GTQ', rate: 1, symbol: 'Q' });
        await get().setCurrency(prev);
      },
    }),
    {
      name: 'cybervaul-currency',
      partialize: (s) => ({ currency: s.currency, rate: s.rate, symbol: s.symbol }),
    }
  )
);
