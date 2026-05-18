// cuenta.validation.js
export const generarNumeroCuenta = function(next) {
    try {
        // 'this' se refiere al documento que se está guardando
        if (!this.no_cuenta) {
            const nuevoNumero = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            this.no_cuenta = nuevoNumero;
        }
        // Ejecutamos next solo si existe y es una función
        if (typeof next === 'function') {
            next();
        }
    } catch (error) {
        if (typeof next === 'function') {
            next(error);
        } else {
            throw error;
        }
    }
};