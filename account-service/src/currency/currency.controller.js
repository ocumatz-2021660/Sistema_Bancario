import { getExchangeRate } from '../../../account-service/helpers/currency-service.js';

export const getRate = async (req, res) => {
  const { to } = req.query;

  if (!to) {
    return res.status(400).json({ success: false, message: 'Parámetro "to" requerido. Ejemplo: ?to=USD' });
  }

  const target = to.toUpperCase();

  if (target === 'GTQ') {
    return res.json({ success: true, data: { from: 'GTQ', to: 'GTQ', rate: 1 } });
  }

  const rate = await getExchangeRate(target);

  if (!rate) {
    return res.status(502).json({ success: false, message: `No se pudo obtener la tasa para ${target}` });
  }

  return res.json({ success: true, data: { from: 'GTQ', to: target, rate } });
};
