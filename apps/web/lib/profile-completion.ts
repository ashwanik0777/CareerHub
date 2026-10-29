import { Profile } from '@platform/types';

export interface CompletionStep {
  name: string;
  weight: number;
  isComplete: (profile: Profile) => boolean;
}

export const PROFILE_COMPLETION_STEPS: CompletionStep[] = [
  {
    name: 'Headline',
    weight: 15,
    isComplete: (p) => !!p.headline?.trim(),
  },
  {
    name: 'Biography',
    weight: 15,
    isComplete: (p) => !!p.bio?.trim(),
  },
  {
    name: 'Location',
    weight: 10,
    isComplete: (p) => !!p.location?.trim(),
  },
  {
    name: 'Work Experience',
    weight: 20,
    isComplete: (p) => !!p.experiences && p.experiences.length > 0,
  },
  {
    name: 'Education',
    weight: 20,
    isComplete: (p) => !!p.educations && p.educations.length > 0,
  },
  {
    name: 'Projects',
    weight: 10,
    isComplete: (p) => !!p.projects && p.projects.length > 0,
  },
  {
    name: 'Skills',
    weight: 10,
    isComplete: (p) => !!p.skills && p.skills.length > 0,
  },
];

export interface ProfileCompletionReport {
  score: number;
  completedSteps: string[];
  missingSteps: string[];
}

export function calculateProfileCompletion(profile: Profile): ProfileCompletionReport {
  let score = 0;
  const completedSteps: string[] = [];
  const missingSteps: string[] = [];

  for (const step of PROFILE_COMPLETION_STEPS) {
    if (step.isComplete(profile)) {
      score += step.weight;
      completedSteps.push(step.name);
    } else {
      missingSteps.push(step.name);
    }
  }

  return {
    score,
    completedSteps,
    missingSteps,
  };
}
