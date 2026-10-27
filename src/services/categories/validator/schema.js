import Joi from 'joi';

export const categoryPayloadSchema = Joi.object({
  name: Joi.string().required(),
});