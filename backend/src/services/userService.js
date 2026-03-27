const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { parsePagination, buildMeta } = require('../utils/pagination');

const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
};

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = {};
  if (query.role) where.role = query.role;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({ where, select: SAFE_SELECT, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: buildMeta(total, page, limit) };
};

const getById = async (id) => {
  const user = await prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

const create = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (existing) {
    const err = new Error('A user with that email already exists.');
    err.statusCode = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase().trim(), password: hashed, role: role || 'user' },
    select: SAFE_SELECT,
  });

  return user;
};

const update = async (id, { name, email, role }) => {
  await getById(id); // validates existence

  const data = {};
  if (name) data.name = name;
  if (email) data.email = email.toLowerCase().trim();
  if (role) data.role = role;

  const user = await prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
  return user;
};

const remove = async (id) => {
  await getById(id);
  await prisma.user.delete({ where: { id } });
};

const updateRole = async (id, role) => {
  await getById(id);
  return prisma.user.update({ where: { id }, data: { role }, select: SAFE_SELECT });
};

module.exports = { getAll, getById, create, update, remove, updateRole };
