const prisma = require('../config/database');

const getAll = async (userId) => {
  return prisma.debt.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
};

const create = async (userId, { name, totalAmount }) => {
  return prisma.debt.create({
    data: { name, totalAmount: parseFloat(totalAmount), userId },
    include: { payments: true },
  });
};

const update = async (id, userId, { name, totalAmount }) => {
  const existing = await prisma.debt.findFirst({ where: { id, userId } });
  if (!existing) {
    const err = new Error('Debt not found.');
    err.statusCode = 404;
    throw err;
  }
  const data = {};
  if (name !== undefined) data.name = name;
  if (totalAmount !== undefined) data.totalAmount = parseFloat(totalAmount);
  return prisma.debt.update({ where: { id }, data, include: { payments: true } });
};

const remove = async (id, userId) => {
  const existing = await prisma.debt.findFirst({ where: { id, userId } });
  if (!existing) {
    const err = new Error('Debt not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.debt.delete({ where: { id } });
};

const addPayment = async (debtId, userId, { amount, note }) => {
  const debt = await prisma.debt.findFirst({ where: { id: debtId, userId } });
  if (!debt) {
    const err = new Error('Debt not found.');
    err.statusCode = 404;
    throw err;
  }
  return prisma.debtPayment.create({
    data: { debtId, amount: parseFloat(amount), note: note || null },
  });
};

const deletePayment = async (paymentId, userId) => {
  const payment = await prisma.debtPayment.findFirst({
    where: { id: paymentId },
    include: { debt: true },
  });
  if (!payment || payment.debt.userId !== userId) {
    const err = new Error('Payment not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.debtPayment.delete({ where: { id: paymentId } });
};

module.exports = { getAll, create, update, remove, addPayment, deletePayment };
