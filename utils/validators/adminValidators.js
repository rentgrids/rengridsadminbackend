import Joi from 'joi';

export const createAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  status: Joi.string().valid('active', 'inactive').default('active'),
  isSuperAdmin: Joi.boolean().default(false),
  roleIds: Joi.array().items(Joi.number()).default([]),
  permissionIds: Joi.array().items(Joi.number()).default([])
});

export const updateAdminSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  status: Joi.string().valid('active', 'inactive'),
  isSuperAdmin: Joi.boolean(),
  roleIds: Joi.array().items(Joi.number()),
  permissionIds: Joi.array().items(Joi.number())
});

export const createRoleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100),
  description: Joi.string().max(255),
  permissionIds: Joi.array().items(Joi.number()).default([])
});

export const createPermissionSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  module: Joi.string().min(2).max(50).required(),
  action: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(255)
});