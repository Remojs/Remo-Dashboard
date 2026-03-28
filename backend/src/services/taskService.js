const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.completed !== undefined) {
    where.completed = query.completed === 'true';
  }

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, meta: buildMeta(total, page, limit) };
};

const getById = async (id) => {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }
  return task;
};

const create = async ({ title, description, createdById }) => {
  return prisma.task.create({
    data: {
      title,
      description: description || null,
      completed: false,
      createdById: createdById || null,
    },
  });
};

const update = async (id, { title, description, completed }) => {
  await getById(id);

  const data = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (completed !== undefined) data.completed = Boolean(completed);

  return prisma.task.update({ where: { id }, data });
};

const remove = async (id) => {
  await getById(id);
  await prisma.task.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };

