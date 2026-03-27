const { Router } = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const emailRoutes = require('./emailRoutes');
const passwordRoutes = require('./passwordRoutes');
const projectRoutes = require('./projectRoutes');
const taskRoutes = require('./taskRoutes');
const expenseRoutes = require('./expenseRoutes');
const websiteRoutes = require('./websiteRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/emails', emailRoutes);
router.use('/passwords', passwordRoutes);
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);
router.use('/expenses', expenseRoutes);
router.use('/websites', websiteRoutes);

module.exports = router;
