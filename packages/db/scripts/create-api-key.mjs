#!/usr/bin/env node
/**
 * Creates an API key for a user, printed once to stdout.
 *
 * Usage:
 *   node packages/db/scripts/create-api-key.mjs --email user@platform.com \
 *     --name "Extension AI key" --scopes ai:predict,profile:read
 */
import { randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

function arg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const email = arg('--email');
const name = arg('--name', 'API key');
const scopes = (arg('--scopes', 'profile:read') || '').split(',').map((s) => s.trim()).filter(Boolean);

if (!email) {
  console.error('Usage: create-api-key.mjs --email <user email> [--name <label>] [--scopes a,b]');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  const key = `chk_${randomBytes(24).toString('hex')}`;
  await prisma.apiKey.create({
    data: { userId: user.id, key, name, scopes },
  });

  console.log('API key created. Store it now — it is shown only once:');
  console.log(key);
  console.log(`user: ${email} | name: ${name} | scopes: ${scopes.join(', ')}`);
} finally {
  await prisma.$disconnect();
}
