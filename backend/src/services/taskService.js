const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.assignedTo) where.assignedTo = query.assignedTo;

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.task.count({ where }),
  ]);

  return { tasks, meta: buildMeta(total, page, limit) };
};

const getById = async (id) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!task) {
    const err = new Error('Task not found.');
    err.statusCode = 404;
    throw err;
  }
  return task;
};

const create = async ({ title, description, status, assignedTo, priority }) => {
  return prisma.task.create({
    data: {
      title,
      description: description || null,
      status: status || 'idea',
      assignedTo: assignedTo || null,
      priority: priority || 'medium',
    },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
};

const update = async (id, { title, description, status, assignedTo, priority }) => {
  await getById(id);

  const data = {};
  if (title) data.title = title;
  if (description !== undefined) data.description = description;
  if (status) data.status = status;
  if (assignedTo !== undefined) data.assignedTo = assignedTo;
  if (priority) data.priority = priority;

  return prisma.task.update({
    where: { id },
    data,
    include: {
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
};

const remove = async (id) => {
  await getById(id);
  await prisma.task.delete({ where: { id } });
};

module.exports = { getAll, getById, create, update, remove };
