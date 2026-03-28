/**
 * Seed script — creates 3 users and sample data for each module.
 * Run: node prisma/seed.js
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { encrypt } = require('../src/utils/crypto');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱  Starting seed...');

  // ── Users ──────────────────────────────────────────
  const hashedSantino = await bcrypt.hash('ISs2026@dpS', 12);
  const hashedThiago  = await bcrypt.hash('ISt2026@dpT', 12);
  const hashedLucas   = await bcrypt.hash('ISl2026@dpL', 12);

  const santino = await prisma.user.upsert({
    where: { email: 'santino@interaktivesolutions.com' },
    update: {},
    create: {
      name: 'Santino',
      email: 'santino@interaktivesolutions.com',
      password: hashedSantino,
      role: 'admin',
    },
  });

  const thiago = await prisma.user.upsert({
    where: { email: 'thiago@interaktivesolutions.com' },
    update: {},
    create: {
      name: 'Thiago',
      email: 'thiago@interaktivesolutions.com',
      password: hashedThiago,
      role: 'user',
    },
  });

  const lucas = await prisma.user.upsert({
    where: { email: 'lucas@interaktivesolutions.com' },
    update: {},
    create: {
      name: 'Lucas',
      email: 'lucas@interaktivesolutions.com',
      password: hashedLucas,
      role: 'user',
    },
  });

}