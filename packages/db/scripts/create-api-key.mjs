#!/usr/bin/env node
/**
 * Creates an API key for a user, printed once to stdout. Only the SHA-256
 * hash is stored, so a lost key cannot be recovered — create a new one.
 *
 * Usage:
 *   node packages/db/scripts/create-api-key.mjs --email user@platform.com \
 *     --name "Extension AI key" --scopes ai:predict,profile:read [--expires-days 90]
 */
import { createHash, randomBytes } from 'crypto';
import { PrismaClient } from '@prisma/client';

function arg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const email = (arg('--email') || '').trim().toLowerCase();
const name = arg('--name', 'API key');
const scopes = (arg('--scopes', 'profile:read') || '').split(',').map((s) => s.trim()).filter(Boolean);
const expiresDays = Number(arg('--expires-days', '0'));

if (!email) {
  console.error('Usage: create-api-key.mjs --email <user email> [--name <label>] [--scopes a,b] [--expires-days n]');
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
    data: {
      userId: user.id,
      keyHash: createHash('sha256').update(key, 'utf8').digest('hex'),
      keyPrefix: key.slice(0, 8),
      name,
      scopes,
      expiresAt: expiresDays > 0 ? new Date(Date.now() + expiresDays * 86_400_000) : null,
    },
  });

  console.log('API key created. Store it now — it is shown only once and cannot be recovered:');
  console.log(key);
  console.log(`user: ${email} | name: ${name} | scopes: ${scopes.join(', ')}${expiresDays > 0 ? ` | expires in ${expiresDays}d` : ''}`);
} finally {
  await prisma.$disconnect();
}
