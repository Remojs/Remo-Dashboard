const prisma = require('../config/database');

const getAll = async (userId) => {
  return prisma.passwordGroup.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: { select: { passwords: true } },
    },
  });
};

const getById = async (id, userId) => {
  const group = await prisma.passwordGroup.findFirst({ where: { id, userId } });
  if (!group) {
    const err = new Error('Group not found.');
    err.statusCode = 404;
    throw err;
  }
  return group;
};

const create = async (userId, { name }) => {
  return prisma.passwordGroup.create({
    data: { name, userId },
    include: { _count: { select: { passwords: true } } },
  });
};

const update = async (id, userId, { name }) => {
  await getById(id, userId);
  return prisma.passwordGroup.update({
    where: { id },
    data: { name },
    include: { _count: { select: { passwords: true } } },
  });
};

const remove = async (id, userId) => {
  await getById(id, userId);
  await prisma.passwordGroup.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
