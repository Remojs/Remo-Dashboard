const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Parses and validates pagination query params.
 * @param {object} query - Express req.query
 * @returns {{ skip: number, take: number, page: number, limit: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};

/**
 * Builds pagination meta object for response envelope.
 * @param {number} total  - total records count
 * @param {number} page
 * @param {number} limit
 */
const buildMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { parsePagination, buildMeta };
