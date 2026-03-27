import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
  },

  // SMTP Configuration (aligned with .NET SmtpSettings)
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    enableSsl: process.env.SMTP_SECURE === 'true', // CORREGIDO: Cambié SMTP_ENABLE_SSL por SMTP_SECURE
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    fromEmail: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  },

  // File Upload Configuration (aligned with .NET FileValidator)
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB (aligned with .NET)
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], // aligned with .NET
    uploadPath: process.env.UPLOAD_PATH,
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    baseUrl: process.env.CLOUDINARY_BASE_URL,
    // Expand nested env references if not supported by dotenv
    // If CLOUDINARY_DEFAULT_AVATAR contains ${...}, build it from folder + filename
    defaultAvatarPath:
      process.env.CLOUDINARY_DEFAULT_AVATAR &&
      !process.env.CLOUDINARY_DEFAULT_AVATAR.includes('${')
        ? process.env.CLOUDINARY_DEFAULT_AVATAR
        : [
            process.env.CLOUDINARY_FOLDER,
            process.env.CLOUDINARY_DEFAULT_AVATAR_FILENAME,
          ]
            .filter(Boolean)
            .join('/'),
    folder: process.env.CLOUDINARY_FOLDER,
  },

  // Rate Limiting (aligned with .NET AuthPolicy and ApiPolicy)
  rateLimit: {
    // General API rate limiting (aligned with .NET ApiPolicy: 20 tokens per minute)
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 20,
    // Auth endpoints rate limiting (aligned with .NET AuthPolicy: 5 requests per minute)
    authWindowMs: 1 * 60 * 1000, // 1 minute
    authMaxRequests: 5,
    // Email endpoints rate limiting (more restrictive for security)
    emailWindowMs: 15 * 60 * 1000, // 15 minutes
    emailMaxRequests: 3,
  },

  // Security (aligned with .NET Security configuration)
  security: {
    saltRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 30 * 60 * 1000,
    passwordMinLength: 8,
    // IP Filtering (aligned with .NET IpFilteringMiddleware)
    blacklistedIPs: process.env.BLACKLISTED_IPS
      ? process.env.BLACKLISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    whitelistedIPs: process.env.WHITELISTED_IPS
      ? process.env.WHITELISTED_IPS.split(',').map((ip) => ip.trim())
      : [],
    restrictedPaths: process.env.RESTRICTED_PATHS
      ? process.env.RESTRICTED_PATHS.split(',').map((path) => path.trim())
      : [],
  },

  // App Settings (aligned with .NET AppSettings)
  app: {
    frontendUrl: process.env.FRONTEND_URL,
  },

  // Security Settings (aligned with .NET Security config)
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
    adminAllowedOrigins: process.env.ADMIN_ALLOWED_ORIGINS
      ? process.env.ADMIN_ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
  },

  // Verification tokens
  verification: {
    // Read expirations from env (hours) for easy configuration and parity with .NET
    emailTokenExpiry:
      (process.env.VERIFICATION_EMAIL_EXPIRY_HOURS
        ? parseInt(process.env.VERIFICATION_EMAIL_EXPIRY_HOURS, 10)
        : 24) *
      60 *
      60 *
      1000,
    passwordResetExpiry:
      (process.env.PASSWORD_RESET_EXPIRY_HOURS
        ? parseInt(process.env.PASSWORD_RESET_EXPIRY_HOURS, 10)
        : 1) *
      60 *
      60 *
      1000,
  },
};