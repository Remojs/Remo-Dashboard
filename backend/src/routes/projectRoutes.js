const { Router } = require('express');
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/monthly-revenue', projectController.getMonthlyRevenue);
router.get('/', validatePagination, projectController.getAll);
router.get('/:id', projectController.getById);
router.post('/', requireFields(['clientName', 'type', 'price']), projectController.create);
router.put('/:id', projectController.update);
router.delete('/:id', projectController.remove);

module.exports = router;
