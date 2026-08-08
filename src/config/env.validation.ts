import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  MONGODB_URI: Joi.string().uri({ scheme: ['mongodb', 'mongodb+srv'] }).required(),
  REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('12h'),
  CORS_ORIGINS: Joi.string().default('*'),
  SEED_ADMIN_NAME: Joi.string().default('مدیر سیستم'),
  SEED_ADMIN_PHONE: Joi.string().pattern(/^09\d{9}$/).required(),
  SEED_ADMIN_PASSWORD: Joi.string().min(12).required(),
});
