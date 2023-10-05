const Joi = require("joi");

const checkIdSchema = (nameKey) => {
  return Joi.object({
    [nameKey]: Joi.number().integer().positive().required(),
  });
};

exports.checkIdSchema = checkIdSchema;
