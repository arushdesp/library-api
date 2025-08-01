const Joi = require('joi');

/**
 * Validation schema for user registration
 */
const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address 📧',
      'any.required': 'Email is required 📧'
    }),
  
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long 🔐',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character 🔐',
      'any.required': 'Password is required 🔐'
    }),
  
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long 👤',
      'string.max': 'First name must be less than 50 characters 👤',
      'any.required': 'First name is required 👤'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long 👤',
      'string.max': 'Last name must be less than 50 characters 👤',
      'any.required': 'Last name is required 👤'
    })
});

/**
 * Validation schema for user login
 */
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address 📧',
      'any.required': 'Email is required 📧'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required 🔐'
    })
});

/**
 * Validation schema for password change
 */
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required 🔐'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long 🔐',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character 🔐',
      'any.required': 'New password is required 🔐'
    })
});

/**
 * Validation schema for user profile update
 */
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'First name must be at least 2 characters long 👤',
      'string.max': 'First name must be less than 50 characters 👤'
    }),
  
  lastName: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Last name must be at least 2 characters long 👤',
      'string.max': 'Last name must be less than 50 characters 👤'
    }),
  
  email: Joi.string()
    .email()
    .messages({
      'string.email': 'Please provide a valid email address 📧'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  updateProfileSchema
}; 