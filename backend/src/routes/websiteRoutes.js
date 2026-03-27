const { Router } = require('express');
const websiteController = require('../controllers/websiteController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, websiteController.getAll);
router.post('/', authorize('admin'), requireFields(['name', 'domain']), websiteController.create);
router.delete('/:id', authorize('admin'), websiteController.remove);
router.get('/:id/status', validatePagination, websiteController.getStatus);
router.post('/check', websiteController.check);

module.exports = router;
