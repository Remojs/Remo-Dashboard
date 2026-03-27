const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

/**
 * Verifies the Bearer JWT token attached to the request.
 * Attaches the decoded payload to req.user on success.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required. Provide a Bearer token.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please log in again.', 401);
    }
    return error(res, 'Invalid token.', 401);
  }
};

/**
 * Restricts access to the specified roles.
 * Must be used AFTER `authenticate`.
 * @param {...string} roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to perform this action.', 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };
