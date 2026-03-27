const { Router } = require('express');
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { requireFields, validatePagination } = require('../middlewares/validateMiddleware');

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', validatePagination, userController.getAll);
router.get('/:id', userController.getById);

// Only admins can create, update, delete, or change roles
router.post('/', authorize('admin'), requireFields(['name', 'email', 'password']), userController.create);
router.put('/:id', authorize('admin'), userController.update);
router.delete('/:id', authorize('admin'), userController.remove);
router.patch('/:id/role', authorize('admin'), requireFields(['role']), userController.updateRole);

module.exports = router;
