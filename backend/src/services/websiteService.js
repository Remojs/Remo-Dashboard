const prisma = require('../config/database');
const { checkWebsite } = require('../utils/monitoring');
const { parsePagination, buildMeta } = require('../utils/pagination');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);

  const [websites, total] = await prisma.$transaction([
    prisma.website.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        statuses: {
          orderBy: { checkedAt: 'desc' },
          take: 1, // last status only
        },
      },
    }),
    prisma.website.count(),
  ]);

  return { websites, meta: buildMeta(total, page, limit) };
};

const create = async ({ name, domain }) => {
  const normalised = domain.replace(/\/$/, '').toLowerCase();
  return prisma.website.create({ data: { name, domain: normalised } });
};

const remove = async (id) => {
  const existing = await prisma.website.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Website not found.');
    err.statusCode = 404;
    throw err;
  }
  await prisma.website.delete({ where: { id } });
};

const getStatus = async (id, query) => {
  const existing = await prisma.website.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error('Website not found.');
    err.statusCode = 404;
    throw err;
  }

  const { skip, take, page, limit } = parsePagination(query);

  const [statuses, total] = await prisma.$transaction([
    prisma.websiteStatus.findMany({
      where: { websiteId: id },
      skip,
      take,
      orderBy: { checkedAt: 'desc' },
    }),
    prisma.websiteStatus.count({ where: { websiteId: id } }),
  ]);

  return { website: existing, statuses, meta: buildMeta(total, page, limit) };
};

/**
 * Checks one or all websites and persists the results.
 * @param {string|null} id - if provided, checks a single website
 */
const checkAndStore = async (id = null) => {
  const whereClause = id ? { id } : {};
  const websites = await prisma.website.findMany({ where: whereClause });

  if (websites.length === 0) {
    const err = new Error('No websites to check.');
    err.statusCode = 404;
    throw err;
  }

  const results = await Promise.allSettled(
    websites.map(async (site) => {
      const { frontendStatus, backendStatus, responseTime, ttfb } = await checkWebsite(site.domain);

      // Calculate uptime: percentage of 'online' checks in last 100 checks
      const last100 = await prisma.websiteStatus.findMany({
        where: { websiteId: site.id },
        orderBy: { checkedAt: 'desc' },
        take: 100,
        select: { frontendStatus: true },
      });

      const onlineCount = last100.filter((s) => s.frontendStatus === 'online').length + 1;
      const uptimePercentage = parseFloat(((onlineCount / (last100.length + 1)) * 100).toFixed(2));

      const status = await prisma.websiteStatus.create({
        data: {
          websiteId: site.id,
          frontendStatus,
          backendStatus,
          responseTime,
          ttfb,
          uptimePercentage,
        },
      });

      return { website: site.name, ...status };
    })
  );

  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
};

module.exports = { getAll, create, remove, getStatus, checkAndStore };
