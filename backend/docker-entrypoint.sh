#!/bin/sh
# docker-entrypoint.sh
# Aplica el schema de SQLite y crea el admin desde variables de entorno.

set -e

echo "⏳ Aplicando schema (prisma db push)..."
npx prisma db push --accept-data-loss

# Crear admin desde env vars si la tabla de users está vacía
echo "👤 Verificando usuario admin..."
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME || 'Admin';
p.user.count().then(async n => {
  if (n === 0) {
    if (!email || !password) {
      console.warn('⚠️  ADMIN_EMAIL / ADMIN_PASSWORD no definidos. No se creó usuario admin.');
    } else {
      const hashed = await bcrypt.hash(password, 12);
      await p.user.create({ data: { name, email, password: hashed, role: 'admin' } });
      console.log('✅ Usuario admin creado:', email);
    }
  } else {
    console.log('ℹ️  Ya hay ' + n + ' usuario(s). Creación omitida.');
  }
  p.\$disconnect();
}).catch(e => { console.error(e); process.exit(1); });
"

echo "🚀 Iniciando backend..."
exec "$@"
