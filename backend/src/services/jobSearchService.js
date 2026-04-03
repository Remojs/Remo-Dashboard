const prisma = require('../config/database');

// ── Job Boards ────────────────────────────────────────────────────────────────

const getAllBoards = async () => {
  return prisma.jobBoard.findMany({ orderBy: { createdAt: 'desc' } });
};

const createBoard = async ({ name, url, description, color, emoji }) => {
  return prisma.jobBoard.create({
    data: {
      name,
      url,
      description: description || null,
      color: color || 'violet',
      emoji: emoji || '💼',
    },
  });
};

const removeBoard = async (id) => {
  const existing = await prisma.jobBoard.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Job board not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.jobBoard.delete({ where: { id } });
};

// ── Job Applications ──────────────────────────────────────────────────────────

const getAllApplications = async () => {
  return prisma.jobApplication.findMany({ orderBy: { date: 'desc' } });
};

const createApplication = async ({ company, position, url, status, date, notes, salary }) => {
  return prisma.jobApplication.create({
    data: {
      company,
      position,
      url: url || null,
      status: status || 'applied',
      date: date ? new Date(date) : new Date(),
      notes: notes || null,
      salary: salary || null,
    },
  });
};

const updateApplication = async (id, data) => {
  const existing = await prisma.jobApplication.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Application not found.');
    err.statusCode = 404;
    throw err;
  }
  const updateData = {};
  if (data.company !== undefined) updateData.company = data.company;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.url !== undefined) updateData.url = data.url || null;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.date !== undefined) updateData.date = new Date(data.date);
  if (data.notes !== undefined) updateData.notes = data.notes || null;
  if (data.salary !== undefined) updateData.salary = data.salary || null;
  return prisma.jobApplication.update({ where: { id }, data: updateData });
};

const removeApplication = async (id) => {
  const existing = await prisma.jobApplication.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Application not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.jobApplication.delete({ where: { id } });
};

module.exports = {
  getAllBoards,
  createBoard,
  removeBoard,
  getAllApplications,
  createApplication,
  updateApplication,
  removeApplication,
};
