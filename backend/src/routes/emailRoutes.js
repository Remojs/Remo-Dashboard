const { Router } = require('express');
const emailController = require('../controllers/emailController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, emailController.getAll);
router.post('/', requireFields(['from', 'subject', 'body']), emailController.create);
router.put('/:id/read', emailController.markRead);

module.exports = router;
