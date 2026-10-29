import { z } from 'zod';

export const BaseEntitySchema = z.object({
  id: z.string().uuid().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  source: z.string().optional(), // 'user', 'ai', 'import'
  confidence: z.number().min(0).max(1).optional(),
});

export type BaseEntity = z.infer<typeof BaseEntitySchema>;
