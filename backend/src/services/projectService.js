const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = { contains: query.type, mode: 'insensitive' };
  if (query.from || query.to) {
    where.createdAt = {};
    if (query.from) where.createdAt.gte = new Date(query.from);
    if (query.to) where.createdAt.lte = new Date(query.to);
  }

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.project.count({ where }),
  ]);

  return { projects, meta: buildMeta(total, page, limit) };
};

const getById = async (id) => {
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    const err = new Error('Project not found.');
    err.statusCode = 404;
    throw err;
  }
  return project;
};

const create = async ({ clientName, type, price, status }) => {
  return prisma.project.create({
    data: { clientName, type, price, status: status || 'pending' },
  });
};

const update = async (id, { clientName, type, price, status }) => {
  await getById(id);

  const data = {};
  if (clientName) data.clientName = clientName;
  if (type) data.type = type;
  if (price !== undefined) data.price = price;
  if (status) data.status = status;

  return prisma.project.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  await prisma.project.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove, getMonthlyRevenue };

/**
 * Returns total revenue grouped by month for a given year (completed projects only).
 */
async function getMonthlyRevenue(year) {
  const targetYear = year ? parseInt(year, 10) : new Date().getFullYear();
  const startDate = new Date(targetYear, 0, 1);
  const endDate = new Date(targetYear + 1, 0, 1);

  const projects = await prisma.project.findMany({
    where: { status: 'completed', createdAt: { gte: startDate, lt: endDate } },
    select: { price: true, createdAt: true },
  });

  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: new Date(targetYear, i, 1).toLocaleString('es-AR', { month: 'long' }),
    total: 0,
  }));

  for (const project of projects) {
    const month = new Date(project.createdAt).getMonth();
    monthly[month].total = parseFloat((monthly[month].total + Number(project.price)).toFixed(2));
  }

  const grandTotal = monthly.reduce((sum, m) => sum + m.total, 0);
  return { year: targetYear, monthly, grandTotal: parseFloat(grandTotal.toFixed(2)) };
}
