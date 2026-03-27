const fs = require('fs/promises');
const path = require('path');

async function ensureCollectionFile(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, '[]', 'utf8');
  }
}

async function readCollection(filePath) {
  await ensureCollectionFile(filePath);
  const raw = await fs.readFile(filePath, 'utf8');

  if (!raw.trim()) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = [];
  }

  return Array.isArray(parsed) ? parsed : [];
}

async function writeCollection(filePath, rows) {
  await ensureCollectionFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(rows, null, 2), 'utf8');
}

module.exports = { readCollection, writeCollection };
