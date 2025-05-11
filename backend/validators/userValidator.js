// validators/userValidator.js
const Joi = require("joi");

// Validation for user registration
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  image: Joi.string().optional(),
  aboutMe: Joi.string().max(500).optional(),
  type: Joi.string().valid("student", "faculty").required(),
  document: Joi.string().optional(),
});

// Validation for user login
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };