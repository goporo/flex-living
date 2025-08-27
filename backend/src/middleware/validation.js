const Joi = require('joi');

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        details: error.details.map(detail => detail.message)
      });
    }

    req.query = value;
    next();
  };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request body',
        details: error.details.map(detail => detail.message)
      });
    }

    req.body = value;
    next();
  };
};

// Common validation schemas
const reviewsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  propertyId: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  status: Joi.alternatives().try(
    Joi.string().valid('pending', 'approved', 'rejected'),
    Joi.array().items(Joi.string().valid('pending', 'approved', 'rejected'))
  ),
  rating: Joi.string().pattern(/^\d+-\d+$/), // Format: "4-5"
  dateFrom: Joi.date().iso(),
  dateTo: Joi.date().iso(),
  channel: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ),
  search: Joi.string().max(255),
  sortBy: Joi.string().valid('date', 'rating', 'property', 'status').default('date'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

const reviewActionSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().max(500),
  actionBy: Joi.string().required(),
  notes: Joi.string().max(1000)
});

const bulkActionSchema = Joi.object({
  reviewIds: Joi.array().items(Joi.string()).min(1).required(),
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().max(500),
  actionBy: Joi.string().required()
});

module.exports = {
  validateQuery,
  validateBody,
  reviewsQuerySchema,
  reviewActionSchema,
  bulkActionSchema
};
