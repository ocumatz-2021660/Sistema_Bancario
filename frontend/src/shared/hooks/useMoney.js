import { useCurrencyStore } from '../store/useCurrencyStore';

/**
 * useMoney — convierte y formatea cualquier monto en GTQ a la moneda activa.
 *
 * Uso:
 *   const { format, symbol, currency } = useMoney();
 *   <span>{format(account.balance)}</span>   // "$ 15.23" o "Q 118.50"
 *
 * Nunca usar para puntos de canje — solo dinero real.
 */
export const useMoney = () => {
  const { rate, symbol, currency } = useCurrencyStore();

  const format = (amountInGTQ) => {
    if (amountInGTQ == null || isNaN(amountInGTQ)) return `${symbol} —`;

    const converted = parseFloat(amountInGTQ) * rate;

    // JPY, KRW y CLP no usan decimales
    const noDecimals = ['JPY', 'KRW', 'CLP', 'COP'].includes(currency);
    const decimals = noDecimals ? 0 : 2;

    const formatted = converted.toLocaleString('es-GT', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return `${symbol} ${formatted}`;
  };

  return { format, symbol, currency, rate };
};
