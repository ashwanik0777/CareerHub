#!/usr/bin/env node
/**
 * Sets a user's role (e.g. promote to ADMIN so /dashboard/admin is accessible).
 *
 * Usage:
 *   node packages/db/scripts/set-role.mjs --email user@platform.com --role ADMIN
 */
import { PrismaClient } from '@prisma/client';

function arg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  return idx > -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const email = arg('--email');
const role = (arg('--role', 'ADMIN') || 'ADMIN').toUpperCase();
const VALID_ROLES = ['USER', 'ADMIN', 'SUPERADMIN'];

if (!email || !VALID_ROLES.includes(role)) {
  console.error('Usage: set-role.mjs --email <user email> --role USER|ADMIN|SUPERADMIN');
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({ where: { email }, data: { role } });
  console.log(`Role updated: ${user.email} -> ${user.role}`);
} catch (e) {
  console.error(`Failed: ${e.code === 'P2025' ? `no user with email ${email}` : e.message}`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
