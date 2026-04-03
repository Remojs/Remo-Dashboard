const { Router } = require('express');

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const emailRoutes = require('./emailRoutes');
const passwordRoutes = require('./passwordRoutes');
const passwordGroupRoutes = require('./passwordGroupRoutes');
const taskRoutes = require('./taskRoutes');
const expenseRoutes = require('./expenseRoutes');
const websiteRoutes = require('./websiteRoutes');
const toolRoutes = require('./toolRoutes');
const adminDashboardRoutes = require('./adminDashboardRoutes');
const debtRoutes = require('./debtRoutes');
const incomeRoutes = require('./incomeRoutes');
const jobSearchRoutes = require('./jobSearchRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/emails', emailRoutes);
router.use('/passwords', passwordRoutes);
router.use('/password-groups', passwordGroupRoutes);
router.use('/tasks', taskRoutes);
router.use('/expenses', expenseRoutes);
router.use('/websites', websiteRoutes);
router.use('/tools', toolRoutes);
router.use('/admin-dashboards', adminDashboardRoutes);
router.use('/debts', debtRoutes);
router.use('/incomes', incomeRoutes);
router.use('/job-search', jobSearchRoutes);

module.exports = router;

