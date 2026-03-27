const { Router } = require('express');
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

router.use(authenticate);

router.get('/', validatePagination, taskController.getAll);
router.get('/:id', taskController.getById);
router.post('/', requireFields(['title']), taskController.create);
router.put('/:id', taskController.update);
router.delete('/:id', taskController.remove);

module.exports = router;
