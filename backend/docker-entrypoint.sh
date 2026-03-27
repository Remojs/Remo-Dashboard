#!/bin/sh
# docker-entrypoint.sh
# Crea/actualiza el schema de SQLite y hace seed en el primer boot.

set -e

echo "⏳ Aplicando schema (prisma db push)..."
npx prisma db push --accept-data-loss

# Seed solo si la tabla de users está vacía
echo "🌱 Verificando seed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.count().then(n => {
  if (n === 0) {
    console.log('DB vacía, ejecutando seed...');
    const { execSync } = require('child_process');
    execSync('node prisma/seed.js', { stdio: 'inherit' });
  } else {
    console.log('Ya hay ' + n + ' usuario(s). Seed omitido.');
  }
  p.\$disconnect();
}).catch(e => { console.error(e); process.exit(1); });
"

echo "🚀 Iniciando backend..."
exec "\$@"
