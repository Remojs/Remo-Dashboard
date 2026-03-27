/**
 * Builds a standardised success response envelope.
 */
const success = (res, data = null, message = 'OK', statusCode = 200) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  return res.status(statusCode).json(body);
};

/**
 * Builds a standardised error response envelope.
 */
const error = (res, message = 'Internal Server Error', statusCode = 500, details = null) => {
  const body = { success: false, message };
  if (details && process.env.NODE_ENV !== 'production') body.details = details;
  return res.status(statusCode).json(body);
};

/**
 * Builds a paginated response envelope.
 */
const paginated = (res, data, meta, message = 'OK') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
};

module.exports = { success, error, paginated };
