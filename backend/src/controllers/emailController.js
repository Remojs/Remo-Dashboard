const emailService = require('../services/emailService');
const { success, paginated } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const { emails, meta } = await emailService.getAll(req.user.id, req.query);
    return paginated(res, emails, meta);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const email = await emailService.create(req.body);
    return success(res, email, 'Email created successfully.', 201);
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const email = await emailService.markRead(req.params.id);
    return success(res, email, 'Email marked as read.');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, create, markRead };
