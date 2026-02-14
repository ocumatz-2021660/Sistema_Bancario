import {
  getFullImageUrl,
  getDefaultAvatarPath,
} from '../helpers/cloudinary-service.js';

export const buildUserResponse = (user) => {
  // Obtener la URL de la imagen de perfil
  const profilePictureUrl =
    user.UserProfile && user.UserProfile.ProfilePicture
      ? getFullImageUrl(user.UserProfile.ProfilePicture)
      : getFullImageUrl(getDefaultAvatarPath());

  return {
    id: user.Id,
    name: user.Name,
    surname: user.Surname,
    username: user.Username,
    email: user.Email,
    phone:
      user.UserProfile && user.UserProfile.Phone ? user.UserProfile.Phone : '',
    profilePicture: profilePictureUrl,
    role: user.UserRoles?.[0]?.Role?.Name ?? 'USER_ROLE',
    status: user.Status,
    isEmailVerified: user.UserEmail ? user.UserEmail.EmailVerified : false,
    createdAt: user.CreatedAt,
    updatedAt: user.UpdatedAt,
  };
};
