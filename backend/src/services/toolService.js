const path = require('path');
const { randomUUID } = require('crypto');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { readCollection, writeCollection } = require('./jsonStore');

const TOOLS_FILE = path.join(__dirname, '..', 'data', 'tools.json');

const getAll = async (query) => {
  const { skip, take, page, limit } = parsePagination(query);
  const rows = await readCollection(TOOLS_FILE);

  const ordered = [...rows].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  const data = ordered.slice(skip, skip + take);
  return { tools: data, meta: buildMeta(ordered.length, page, limit) };
};

const create = async ({ name, description, url, color, emoji }) => {
  const rows = await readCollection(TOOLS_FILE);

  const tool = {
    id: randomUUID(),
    name: String(name).trim(),
    description: String(description || '').trim(),
    url: String(url).trim(),
    color: String(color).trim(),
    emoji: String(emoji).trim(),
    createdAt: new Date().toISOString(),
  };

  rows.unshift(tool);
  await writeCollection(TOOLS_FILE, rows);

  return tool;
};

const remove = async (id) => {
  const rows = await readCollection(TOOLS_FILE);
  const index = rows.findIndex((item) => item.id === id);

  if (index === -1) {
    const err = new Error('Tool not found.');
    err.statusCode = 404;
    throw err;
  }

  rows.splice(index, 1);
  await writeCollection(TOOLS_FILE, rows);
};

module.exports = { getAll, create, remove };
