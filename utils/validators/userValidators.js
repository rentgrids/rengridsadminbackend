import Joi from 'joi';

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).max(20),
  password: Joi.string().min(6).required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
  user_type: Joi.string().valid('user', 'premium', 'vip').default('user'),
  address: Joi.string().max(500),
  dob: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other')
});

export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  phone: Joi.string().min(10).max(20),
  status: Joi.string().valid('active', 'inactive'),
  user_type: Joi.string().valid('user', 'premium', 'vip'),
  address: Joi.string().max(500),
  dob: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other')
});

export const updateStatusSchema = Joi.object({
  status: Joi.string().valid('active', 'inactive').required()
});

export const updateBlockSchema = Joi.object({
  is_blocked: Joi.boolean().required()
});