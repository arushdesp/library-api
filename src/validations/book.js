const Joi = require('joi');

const bookSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  author: Joi.string().min(3).max(255).required(),
  isbn: Joi.string().min(10).max(13).required(),
  publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
});

module.exports = {
  bookSchema,
};