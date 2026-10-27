/* eslint-disable camelcase */
import Joi from 'joi';

export const applicationPayloadSchema = Joi.object({
  job_id: Joi.string().required(),
  user_id: Joi.string(),
  status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected'),
});

export const applicationStatusPayloadSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected').required(),
});