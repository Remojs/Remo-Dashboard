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
  const hashedPw = await bcrypt.hash('Password123!', 12);

  const santino = await prisma.user.upsert({
    where: { email: 'santino@interaktive.com' },
    update: {},
    create: {
      name: 'Santino',
      email: 'santino@interaktive.com',
      password: hashedPw,
      role: 'admin',
    },
  });

  const thiago = await prisma.user.upsert({
    where: { email: 'thiago@interaktive.com' },
    update: {},
    create: {
      name: 'Thiago',
      email: 'thiago@interaktive.com',
      password: hashedPw,
      role: 'user',
    },
  });

  const lucas = await prisma.user.upsert({
    where: { email: 'lucas@interaktive.com' },
    update: {},
    create: {
      name: 'Lucas',
      email: 'lucas@interaktive.com',
      password: hashedPw,
      role: 'user',
    },
  });

  console.log('✅  Users created:', santino.name, thiago.name, lucas.name);

  // ── Emails ─────────────────────────────────────────
  await prisma.email.createMany({
    data: [
      {
        userId: santino.id,
        type: 'personal',
        from: 'client@example.com',
        subject: 'New project inquiry',
        body: 'Hi, I would like to discuss a landing page project.',
        isRead: false,
      },
      {
        userId: null,
        type: 'shared',
        from: 'support@vendor.com',
        subject: 'Invoice #1042',
        body: 'Please find attached your invoice for last month.',
        isRead: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅  Emails seeded');

  // ── Projects ───────────────────────────────────────
  await prisma.project.createMany({
    data: [
      { clientName: 'Nike AR', type: 'landing', price: 1500, status: 'completed' },
      { clientName: 'MegaStore', type: 'ecommerce', price: 4500, status: 'in_progress' },
      { clientName: 'BotFlow Inc', type: 'bot', price: 2200, status: 'pending' },
    ],
    skipDuplicates: true,
  });
  console.log('✅  Projects seeded');

  // ── Tasks ──────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      {
        title: 'Redesign homepage hero',
        description: 'Update hero section with new brand guidelines',
        status: 'in_progress',
        assignedTo: thiago.id,
        priority: 'high',
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'GitHub Actions for staging and production',
        status: 'pending',
        assignedTo: lucas.id,
        priority: 'medium',
      },
      {
        title: 'Explore AI chatbot integration',
        description: 'Research options for adding an AI support bot',
        status: 'idea',
        assignedTo: santino.id,
        priority: 'low',
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅  Tasks seeded');

  // ── Expenses ───────────────────────────────────────
  await prisma.expense.createMany({
    data: [
      { description: 'AWS hosting - March', amount: 120.0, category: 'infrastructure' },
      { description: 'Figma Pro subscription', amount: 45.0, category: 'tools' },
      { description: 'Client lunch meeting', amount: 78.5, category: 'business' },
    ],
    skipDuplicates: true,
  });
  console.log('✅  Expenses seeded');

  // ── Password Manager ───────────────────────────────
  await prisma.password.create({
    data: {
      service: 'AWS Console',
      username: 'admin@interaktive.com',
      passwordEncrypted: encrypt('SuperSecret#AWS2024'),
      notes: 'Main AWS root account',
      createdById: santino.id,
    },
  });
  console.log('✅  Passwords seeded');

  // ── Websites ───────────────────────────────────────
  const site = await prisma.website.create({
    data: {
      name: 'Interaktive Main Site',
      domain: 'https://interaktive.com',
    },
  });

  await prisma.websiteStatus.create({
    data: {
      websiteId: site.id,
      frontendStatus: 'online',
      backendStatus: 'online',
      responseTime: 210,
      ttfb: 95,
      uptimePercentage: 99.98,
    },
  });
  console.log('✅  Websites seeded');

  console.log('\n🎉  Seed completed successfully!');
  console.log('   Default password for all users: Password123!');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
