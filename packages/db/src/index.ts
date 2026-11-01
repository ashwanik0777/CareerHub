import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Explicit runtime exports (an `export *` over the CommonJS Prisma client
// forces bundlers to add runtime interop code); every model/enum type is
// re-exported type-only.
export { Prisma, PrismaClient } from '@prisma/client';
export type * from '@prisma/client';
