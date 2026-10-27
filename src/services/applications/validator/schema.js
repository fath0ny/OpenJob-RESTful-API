import Joi from 'joi';

export const applicationPayloadSchema = Joi.object({
  jobId: Joi.string().required(),
});

export const applicationStatusPayloadSchema = Joi.object({
  status: Joi.string().valid('pending', 'reviewed', 'accepted', 'rejected').required(),
});