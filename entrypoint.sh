#!/bin/sh

echo "📦 Verificando y sincronizando la base de datos con Prisma..."
# Usamos db push para crear las tablas si la base de datos está vacía
npx prisma db push --skip-generate

echo "🚀 Iniciando el servidor Next.js..."
exec node server.js
