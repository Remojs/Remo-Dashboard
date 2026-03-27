const { error } = require('../utils/response');

/**
 * Validates that required fields are present in req.body.
 * @param {string[]} fields - array of required field names
 */
const requireFields = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(
      (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ''
    );

    if (missing.length > 0) {
      return error(res, `Missing required fields: ${missing.join(', ')}`, 400);
    }

    next();
  };
};

/**
 * Validates that query params are valid integers for pagination.
 */
const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || Number(page) < 1)) {
    return error(res, 'Query param "page" must be a positive integer.', 400);
  }

  if (limit && (isNaN(limit) || Number(limit) < 1 || Number(limit) > 100)) {
    return error(res, 'Query param "limit" must be a positive integer (max 100).', 400);
  }

  next();
};

module.exports = { requireFields, validatePagination };
