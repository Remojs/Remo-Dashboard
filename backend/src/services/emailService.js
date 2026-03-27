const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.type) where.type = query.type;
  if (query.is_read !== undefined) where.isRead = query.is_read === 'true';
  if (query.userId) where.userId = query.userId;

  const [emails, total] = await prisma.$transaction([
    prisma.email.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.email.count({ where }),
  ]);

  return { emails, meta: buildMeta(total, page, limit) };
};

const create = async (data) => {
  const email = await prisma.email.create({
    data: {
      userId: data.userId || null,
      type: data.type || 'personal',
      from: data.from,
      subject: data.subject,
      body: data.body,
      isRead: false,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return email;
};

const markRead = async (id) => {
  const existing = await prisma.email.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Email not found.');
    err.statusCode = 404;
    throw err;
  }

  return prisma.email.update({
    where: { id },
    data: { isRead: true },
  });
};

module.exports = { getAll, create, markRead };
