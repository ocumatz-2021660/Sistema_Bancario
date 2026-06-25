// helpers/enrich-with-user.js conecta PG y MONGO para consultas
import { User } from '../src/users/user.model.js';

/**
 * Enriquece uno o varios documentos de MongoDB con los datos del usuario
 * almacenado en PostgreSQL.
 *
 * @param {Object|Array} data        - Documento o array de documentos de Mongo
 * @param {string} userIdField       - Nombre del campo que contiene el ID del usuario de PG
 *                                     (por defecto: 'usuario_cuenta')
 * @param {string[]} attributes      - Campos del usuario a traer de PostgreSQL
 *                                     (por defecto trae los más comunes)
 * @returns {Object|Array}           - Mismo tipo que recibió, pero con el usuario embebido
 *
 * @example
 * // Un solo documento
 * const cuenta = await Cuenta.findById(id);
 * const resultado = await enrichWithUser(cuenta, 'usuario_cuenta');
 *
 * @example
 * // Array de documentos
 * const transacciones = await Transaccion.find({ isActive: true });
 * const resultado = await enrichWithUser(transacciones, 'usuario_id');
 */
export const enrichWithUser = async (
  data,
  userIdField = 'usuario_cuenta',
  attributes = ['Id', 'Name', 'Surname', 'Username', 'Email']
) => {
  if (!data) return null;

  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];

  if (items.length === 0) return isArray ? [] : null;

  // 1. Convertir a objetos planos
  const plainItems = items.map(item =>
    item && typeof item.toObject === 'function' ? item.toObject() : { ...item }
  );

  // 2. Recolectar todos los IDs únicos de PG (evita duplicados)
  const userIds = [
    ...new Set(plainItems.map(i => i[userIdField]).filter(Boolean)),
  ];

  if (userIds.length === 0) {
    // No hay IDs, devolver los items sin modificar
    return isArray ? plainItems : plainItems[0];
  }

  // 3. UNA SOLA consulta a PostgreSQL para todos los IDs
  const usuarios = await User.findAll({
    where: { Id: userIds },
    attributes,
  });

  // 4. Crear un mapa { id → usuario } para acceso O(1)
  const usuariosMap = {};
  usuarios.forEach(u => {
    usuariosMap[u.Id] = u.toJSON ? u.toJSON() : u;
  });

  // 5. Enriquecer cada item con su usuario
  const enriched = plainItems.map(item => ({
    ...item,
    [userIdField]: usuariosMap[item[userIdField]] ?? null,
  }));

  return isArray ? enriched : enriched[0];
};