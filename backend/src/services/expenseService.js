const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.category) where.category = { contains: query.category, mode: 'insensitive' };
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.expense.count({ where }),
  ]);

  return { expenses, meta: buildMeta(total, page, limit) };
};

const create = async ({ description, amount, category }) => {
  return prisma.expense.create({ data: { description, amount, category } });
};

const remove = async (id) => {
  const existing = await prisma.expense.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Expense not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.expense.delete({ where: { id } });
};

/**
 * Returns total expenses grouped by month for a given year (defaults to current year).
 */
const getMonthlyTotal = async (year) => {
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear + 1, 0, 1);

  const expenses = await prisma.expense.findMany({
    where: { createdAt: { gte: startDate, lt: endDate } },
    select: { amount: true, createdAt: true },
  });

  // Aggregate totals into months 1-12
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(targetYear, i, 1).toLocaleString('en-US', { month: 'long' }),
    total: 0,
  }));

  for (const expense of expenses) {
    const month = new Date(expense.createdAt).getMonth(); // 0-indexed
    monthly[month].total = parseFloat((monthly[month].total + Number(expense.amount)).toFixed(2));
  }

  const grandTotal = monthly.reduce((sum, m) => sum + m.total, 0);

  return { year: targetYear, monthly, grandTotal: parseFloat(grandTotal.toFixed(2)) };
};

module.exports = { getAll, create, remove, getMonthlyTotal };
