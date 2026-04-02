const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.source) where.source = query.source;

  const [incomes, total] = await prisma.$transaction([
    prisma.income.findMany({ where, skip, take, orderBy: { date: 'desc' } }),
    prisma.income.count({ where }),
  ]);

  return { incomes, meta: buildMeta(total, page, limit) };
};

const create = async ({ description, amount, source, date }) => {
  return prisma.income.create({
    data: {
      description,
      amount: parseFloat(amount),
      source,
      date: date ? new Date(date) : undefined,
    },
  });
};

const remove = async (id) => {
  const existing = await prisma.income.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Income not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.income.delete({ where: { id } });
};

const getMonthlyTotal = async (year) => {
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();

  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear + 1, 0, 1);

  const incomes = await prisma.income.findMany({
    where: { date: { gte: startDate, lt: endDate } },
    select: { amount: true, date: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(targetYear, i, 1).toLocaleString('en-US', { month: 'long' }),
    total: 0,
  }));

  for (const income of incomes) {
    const month = new Date(income.date).getMonth();
    monthly[month].total = parseFloat((monthly[month].total + Number(income.amount)).toFixed(2));
  }

  const grandTotal = parseFloat(monthly.reduce((s, m) => s + m.total, 0).toFixed(2));

  return { year: targetYear, monthly, grandTotal };
};

module.exports = { getAll, create, remove, getMonthlyTotal };
