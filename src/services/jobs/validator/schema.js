import Joi from 'joi';

export const jobPayloadSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  companyId: Joi.string().required(),
  categoryId: Joi.string().required(),
});

export const jobQuerySchema = Joi.object({
  title: Joi.string().allow(''),
  'company-name': Joi.string().allow(''),
});