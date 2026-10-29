import Joi from 'joi';

export const userPayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('user', 'company').default('user'),
});

export const userUpdatePayloadSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('user', 'company').default('user'),
});