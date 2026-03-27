const { Router } = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireFields } = require('../middlewares/validateMiddleware');

const router = Router();

// POST /auth/login
router.post('/login', requireFields(['email', 'password']), authController.login);

// GET /auth/me  (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
