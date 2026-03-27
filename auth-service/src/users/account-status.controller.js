import { asyncHandler } from '../../middlewares/server-genericError-handler.js';
import { findUserById } from '../../helpers/user-db.js';
import { ACCOUNT_STATUS, ACCOUNT_STATUS_VALUES } from '../../helpers/account-status-constants.js';

export const updateAccountStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { accountStatus } = req.body || {};


  if (!accountStatus) {
    return res.status(400).json({
      success: false,
      message: 'El campo "accountStatus" es requerido.',
      valoresPermitidos: ACCOUNT_STATUS_VALUES,
    });
  }

  if (!ACCOUNT_STATUS_VALUES.includes(accountStatus)) {
    return res.status(400).json({
      success: false,
      message: `Estado no válido. Los valores permitidos son: ${ACCOUNT_STATUS_VALUES.join(', ')}`,
    });
  }

  if (userId === req.userId) {
    return res.status(400).json({
      success: false,
      message: 'No puedes cambiar el estado de tu propia cuenta.',
    });
  }

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  if (user.AccountStatus === accountStatus) {
    return res.status(400).json({
      success: false,
      message: `El usuario ya tiene el estado "${accountStatus}".`,
    });
  }
  // Si se deshabilita → Status = false para que validateJWT también lo bloquee
  // Si se activa      → Status = true
  // Si se pone inactivo → Status = false (no puede logearse hasta verificar email)
  const newStatus = accountStatus === ACCOUNT_STATUS.ACTIVE;

  await user.update({
    AccountStatus: accountStatus,
    Status: newStatus,
  });

  return res.status(200).json({
    success: true,
    message: `Estado de cuenta actualizado a "${accountStatus}" exitosamente.`,
    data: {
      userId: user.Id,
      username: user.Username,
      email: user.Email,
      accountStatus: user.AccountStatus,
      status: user.Status,
    },
  });
});

export const getAccountStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await findUserById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Estado de cuenta obtenido exitosamente.',
    data: {
      userId: user.Id,
      username: user.Username,
      email: user.Email,
      accountStatus: user.AccountStatus,   // 'activo' | 'inactivo' | 'deshabilitado'
      emailVerified: user.UserEmail?.EmailVerified ?? null,
    },
  });
});