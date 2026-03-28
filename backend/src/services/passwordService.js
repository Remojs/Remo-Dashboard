const prisma = require('../config/database');
const { encrypt, decrypt } = require('../utils/crypto');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (userId, query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const where = { createdById: userId };
  if (query.service) where.service = { contains: query.service, mode: 'insensitive' };
  if (query.groupId) where.groupId = query.groupId;

  const [records, total] = await prisma.$transaction([
    prisma.password.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, service: true, username: true, notes: true, groupId: true, createdAt: true },
    }),
    prisma.password.count({ where }),
  ]);

  return { records, meta: buildMeta(total, page, limit) };
};

const getDecrypted = async (id, userId) => {
  const record = await prisma.password.findFirst({ where: { id, createdById: userId } });
  if (!record) {
    const err = new Error('Password record not found.');
    err.statusCode = 404;
    throw err;
  }

  return { ...record, password: decrypt(record.passwordEncrypted) };
};

const create = async (userId, { service, username, password, notes, groupId }) => {
  const record = await prisma.password.create({
    data: {
      service,
      username,
      passwordEncrypted: encrypt(password),
      notes: notes || null,
      groupId: groupId || null,
      createdById: userId,
    },
    select: { id: true, service: true, username: true, notes: true, groupId: true, createdAt: true },
  });
  return record;
};

const update = async (id, userId, { service, username, password, notes, groupId }) => {
  const existing = await prisma.password.findFirst({ where: { id, createdById: userId } });
  if (!existing) {
    const err = new Error('Password record not found.');
    err.statusCode = 404;
    throw err;
  }

  const data = {};
  if (service) data.service = service;
  if (username) data.username = username;
  if (password) data.passwordEncrypted = encrypt(password);
  if (notes !== undefined) data.notes = notes;
  if (groupId !== undefined) data.groupId = groupId || null;

  return prisma.password.update({
    where: { id },
    data,
    select: { id: true, service: true, username: true, notes: true, groupId: true, createdAt: true },
  });
};

const remove = async (id, userId) => {
  const existing = await prisma.password.findFirst({ where: { id, createdById: userId } });
  if (!existing) {
    const err = new Error('Password record not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.password.delete({ where: { id } });
};

module.exports = { getAll, getDecrypted, create, update, remove };

