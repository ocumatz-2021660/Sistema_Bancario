import fetch from 'node-fetch';

export const getExchangeRate = async (targetCurrency) => {
    try {
        const apiKey = process.env.EXCHANGE_RATE_API_KEY;
        const baseCurrency = 'GTQ';
        
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${baseCurrency}/${targetCurrency}`;
        
        const response = await fetch(url);
        const data = await response.json();

        if (data.result === 'success') {
            return data.conversion_rate; 
        } else {
            throw new Error(data['error-type'] || 'Error al obtener la tasa de cambio');
        }
    } catch (error) {
        console.error('Error en CurrencyService:', error.message);
        return null;
    }
};