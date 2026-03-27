const { Router } = require('express');
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, adminDashboardController.getAll);
router.post('/', requireFields(['name', 'url', 'color', 'emoji']), adminDashboardController.create);
router.delete('/:id', adminDashboardController.remove);

module.exports = router;
