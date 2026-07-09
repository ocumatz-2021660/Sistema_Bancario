import { PendingRegistration } from '../src/pending-registration/pending-registration.model.js';

export const createPendingRegistration = async ({ token, email, username, userData, hashedPassword, expiresAt }) => {
  try {
    const existing = await PendingRegistration.findOne({ email });

    if (existing) {
      existing.token = token;
      existing.username = username;
      existing.userData = userData;
      existing.hashedPassword = hashedPassword;
      existing.expiresAt = expiresAt;
      await existing.save();
      return existing;
    }

    const pending = await PendingRegistration.create({
      token,
      email,
      username,
      userData,
      hashedPassword,
      expiresAt,
    });

    return pending;
  } catch (error) {
    console.error('Error creating pending registration:', error);
    throw new Error('Error al guardar registro pendiente');
  }
};

export const findPendingByToken = async (token) => {
  try {
    const pending = await PendingRegistration.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    return pending;
  } catch (error) {
    console.error('Error finding pending registration by token:', error);
    throw new Error('Error al buscar registro pendiente');
  }
};

export const findPendingByEmail = async (email) => {
  try {
    const pending = await PendingRegistration.findOne({
      email: email.toLowerCase(),
      expiresAt: { $gt: new Date() },
    });

    return pending;
  } catch (error) {
    console.error('Error finding pending registration by email:', error);
    throw new Error('Error al buscar registro pendiente');
  }
};

export const findPendingByUsername = async (username) => {
  try {
    const pending = await PendingRegistration.findOne({
      username: username.toLowerCase(),
      expiresAt: { $gt: new Date() },
    });

    return pending;
  } catch (error) {
    console.error('Error finding pending registration by username:', error);
    throw new Error('Error al buscar registro pendiente');
  }
};

export const deletePendingRegistration = async (token) => {
  try {
    await PendingRegistration.deleteOne({ token });
  } catch (error) {
    console.error('Error deleting pending registration:', error);
    throw new Error('Error al eliminar registro pendiente');
  }
};
