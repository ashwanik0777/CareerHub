import { prisma } from '@platform/db';

export interface PlanLimit {
  maxResumes: number;
  maxAiOptimizationsPerMonth: number;
  hasExtensionAutofill: boolean;
  hasPrioritySupport: boolean;
}

export const PLAN_LIMITS: Record<'FREE' | 'PRO' | 'ENTERPRISE', PlanLimit> = {
  FREE: {
    maxResumes: 2,
    maxAiOptimizationsPerMonth: 5,
    hasExtensionAutofill: true,
    hasPrioritySupport: false,
  },
  PRO: {
    maxResumes: 10,
    maxAiOptimizationsPerMonth: 100,
    hasExtensionAutofill: true,
    hasPrioritySupport: true,
  },
  ENTERPRISE: {
    maxResumes: 999,
    maxAiOptimizationsPerMonth: 9999,
    hasExtensionAutofill: true,
    hasPrioritySupport: true,
  },
};

/**
 * Checks if a user has active permissions and quotas remaining for specific actions.
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof PlanLimit,
  currentUsage = 0
): Promise<{ allowed: boolean; limit: any; tier: string }> {
  // Retrieve subscription record
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const tier = subscription && subscription.isActive ? subscription.tier : 'FREE';
  const limits = PLAN_LIMITS[tier];
  const limitValue = limits[feature];

  if (typeof limitValue === 'boolean') {
    return { allowed: limitValue, limit: limitValue, tier };
  }

  if (typeof limitValue === 'number') {
    return {
      allowed: currentUsage < limitValue,
      limit: limitValue,
      tier,
    };
  }

  return { allowed: false, limit: null, tier };
}
