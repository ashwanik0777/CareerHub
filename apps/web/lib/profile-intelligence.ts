// ────────────────────────────────────────────────────────────────────────────
// Profile Intelligence Service
// Computes strength scores, detects inconsistencies, infers attributes,
// and generates privacy-scoped shareable subsets.
// ────────────────────────────────────────────────────────────────────────────

export interface ProfileStrengthCategory {
  category: string;
  weight: number;
  score: number;
  maxScore: number;
  percentage: number;
  missing: string[];
}

export interface ProfileStrengthReport {
  overallScore: number;
  overallPercentage: number;
  categories: ProfileStrengthCategory[];
  suggestions: string[];
}

export interface ProfileInconsistency {
  type: 'date_overlap' | 'missing_description' | 'unverified_skill' | 'employment_gap';
  severity: 'low' | 'medium' | 'high';
  message: string;
  details: Record<string, any>;
}

export interface ShareableProfile {
  scopes: string[];
  data: Record<string, any>;
  generatedAt: string;
}

export class ProfileIntelligence {
  // ──────────────────────────────────────────────────────────────────────────
  // Profile Strength
  // ──────────────────────────────────────────────────────────────────────────

  computeProfileStrength(profile: any): ProfileStrengthReport {
    const categories: ProfileStrengthCategory[] = [];
    const suggestions: string[] = [];

    // 1. Personal Info (20%)
    const personalFields = [
      { key: 'user.name', label: 'Full name', value: profile.user?.name },
      { key: 'headline', label: 'Headline', value: profile.headline },
      { key: 'bio', label: 'Bio / summary', value: profile.bio },
      { key: 'location', label: 'Location', value: profile.location },
    ];
    const personalResult = this._scoreFields(personalFields, 20, 'Personal');
    categories.push(personalResult.category);
    suggestions.push(...personalResult.suggestions);

    // 2. Contact Info (10%)
    const contactFields = [
      { key: 'user.email', label: 'Email address', value: profile.user?.email },
      { key: 'user.phone', label: 'Phone number', value: profile.user?.phone },
    ];
    const contactResult = this._scoreFields(contactFields, 10, 'Contact');
    categories.push(contactResult.category);
    suggestions.push(...contactResult.suggestions);

    // 3. Social Presence (10%)
    const socialFields = [
      { key: 'websiteUrl', label: 'Website URL', value: profile.websiteUrl },
      { key: 'githubUrl', label: 'GitHub URL', value: profile.githubUrl },
      { key: 'linkedinUrl', label: 'LinkedIn URL', value: profile.linkedinUrl },
    ];
    const socialResult = this._scoreFields(socialFields, 10, 'Social Presence');
    categories.push(socialResult.category);
    suggestions.push(...socialResult.suggestions);

    // 4. Employment History (20%)
    const expScore = Math.min((profile.experiences?.length ?? 0) / 2, 1);
    const expDescScore =
      (profile.experiences ?? []).filter((e: any) => e.description && e.description.trim().length > 0).length /
      Math.max(profile.experiences?.length ?? 1, 1);
    const empPercentage = ((expScore * 0.6 + expDescScore * 0.4) * 100);
    const empMissing: string[] = [];
    if (!profile.experiences || profile.experiences.length === 0) {
      empMissing.push('At least one work experience');
    } else if (profile.experiences.some((e: any) => !e.description)) {
      empMissing.push('Descriptions for all experiences');
    }
    categories.push({
      category: 'Employment',
      weight: 20,
      score: +(empPercentage / 100 * 20).toFixed(1),
      maxScore: 20,
      percentage: +empPercentage.toFixed(0),
      missing: empMissing,
    });
    if (empMissing.length) suggestions.push(`Add ${empMissing.join(', ').toLowerCase()} to strengthen your employment section.`);

    // 5. Education (15%)
    const eduScore = Math.min((profile.educations?.length ?? 0) / 1, 1);
    const eduPercentage = eduScore * 100;
    const eduMissing: string[] = [];
    if (!profile.educations || profile.educations.length === 0) {
      eduMissing.push('At least one education entry');
    }
    categories.push({
      category: 'Education',
      weight: 15,
      score: +(eduPercentage / 100 * 15).toFixed(1),
      maxScore: 15,
      percentage: +eduPercentage.toFixed(0),
      missing: eduMissing,
    });
    if (eduMissing.length) suggestions.push('Add your educational background.');

    // 6. Skills (10%)
    const skillsCount = profile.skills?.length ?? 0;
    const skillPercentage = Math.min(skillsCount / 5, 1) * 100;
    const skillMissing: string[] = [];
    if (skillsCount === 0) {
      skillMissing.push('At least one skill');
    } else if (skillsCount < 5) {
      skillMissing.push(`${5 - skillsCount} more skill(s) for a stronger profile`);
    }
    categories.push({
      category: 'Skills',
      weight: 10,
      score: +(skillPercentage / 100 * 10).toFixed(1),
      maxScore: 10,
      percentage: +skillPercentage.toFixed(0),
      missing: skillMissing,
    });
    if (skillMissing.length) suggestions.push('Add more skills to showcase your expertise.');

    // 7. Projects (10%)
    const projCount = profile.projects?.length ?? 0;
    const projPercentage = Math.min(projCount / 2, 1) * 100;
    const projMissing: string[] = [];
    if (projCount === 0) projMissing.push('At least one project');
    categories.push({
      category: 'Projects',
      weight: 10,
      score: +(projPercentage / 100 * 10).toFixed(1),
      maxScore: 10,
      percentage: +projPercentage.toFixed(0),
      missing: projMissing,
    });
    if (projMissing.length) suggestions.push('Showcase your projects to demonstrate hands-on experience.');

    // 8. Other (certifications + awards + languages) (5%)
    const otherCount =
      (profile.certifications?.length ?? 0) +
      (profile.awards?.length ?? 0) +
      (profile.languages?.length ?? 0);
    const otherPercentage = Math.min(otherCount / 2, 1) * 100;
    const otherMissing: string[] = [];
    if (!profile.certifications?.length) otherMissing.push('Certifications');
    if (!profile.awards?.length) otherMissing.push('Awards');
    if (!profile.languages?.length) otherMissing.push('Languages');
    categories.push({
      category: 'Other',
      weight: 5,
      score: +(otherPercentage / 100 * 5).toFixed(1),
      maxScore: 5,
      percentage: +otherPercentage.toFixed(0),
      missing: otherMissing,
    });
    if (otherMissing.length) suggestions.push(`Consider adding: ${otherMissing.join(', ')}.`);

    // Roll up
    const overallScore = categories.reduce((sum, c) => sum + c.score, 0);
    const totalMax = categories.reduce((sum, c) => sum + c.maxScore, 0);
    const overallPercentage = totalMax > 0 ? +(overallScore / totalMax * 100).toFixed(0) : 0;

    return { overallScore: +overallScore.toFixed(1), overallPercentage, categories, suggestions };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Inconsistency Detection
  // ──────────────────────────────────────────────────────────────────────────

  detectInconsistencies(profile: any): ProfileInconsistency[] {
    const issues: ProfileInconsistency[] = [];

    // 1. Date overlaps in experience
    const experiences = (profile.experiences ?? []).sort(
      (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    for (let i = 0; i < experiences.length; i++) {
      for (let j = i + 1; j < experiences.length; j++) {
        const a = experiences[i];
        const b = experiences[j];
        const aEnd = a.endDate ? new Date(a.endDate) : new Date();
        const bStart = new Date(b.startDate);
        if (bStart < aEnd && !a.isCurrent) {
          issues.push({
            type: 'date_overlap',
            severity: 'high',
            message: `Experience "${a.position} at ${a.company}" overlaps with "${b.position} at ${b.company}".`,
            details: {
              experienceA: { id: a.id, position: a.position, company: a.company, startDate: a.startDate, endDate: a.endDate },
              experienceB: { id: b.id, position: b.position, company: b.company, startDate: b.startDate, endDate: b.endDate },
            },
          });
        }
      }
    }

    // 2. Date overlaps in education
    const educations = (profile.educations ?? []).sort(
      (a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    for (let i = 0; i < educations.length; i++) {
      for (let j = i + 1; j < educations.length; j++) {
        const a = educations[i];
        const b = educations[j];
        const aEnd = a.endDate ? new Date(a.endDate) : new Date();
        const bStart = new Date(b.startDate);
        if (bStart < aEnd && !a.isCurrent) {
          issues.push({
            type: 'date_overlap',
            severity: 'medium',
            message: `Education "${a.degree} at ${a.school}" overlaps with "${b.degree} at ${b.school}".`,
            details: {
              educationA: { id: a.id, degree: a.degree, school: a.school, startDate: a.startDate, endDate: a.endDate },
              educationB: { id: b.id, degree: b.degree, school: b.school, startDate: b.startDate, endDate: b.endDate },
            },
          });
        }
      }
    }

    // 3. Missing descriptions on experiences
    for (const exp of experiences) {
      if (!exp.description || exp.description.trim().length === 0) {
        issues.push({
          type: 'missing_description',
          severity: 'medium',
          message: `Experience "${exp.position} at ${exp.company}" has no description.`,
          details: { experienceId: exp.id, position: exp.position, company: exp.company },
        });
      }
    }

    // 4. Skills not backed by any experience or project description
    const allDescriptions = [
      ...(profile.experiences ?? []).map((e: any) => (e.description ?? '').toLowerCase()),
      ...(profile.projects ?? []).map((p: any) => (p.description ?? '').toLowerCase()),
      ...(profile.projects ?? []).flatMap((p: any) => (p.technologies ?? []).map((t: string) => t.toLowerCase())),
    ].join(' ');

    for (const skill of profile.skills ?? []) {
      const skillName = skill.name.toLowerCase();
      if (!allDescriptions.includes(skillName)) {
        issues.push({
          type: 'unverified_skill',
          severity: 'low',
          message: `Skill "${skill.name}" is not referenced in any experience or project.`,
          details: { skillId: skill.id, skillName: skill.name },
        });
      }
    }

    // 5. Employment gaps > 6 months
    const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < experiences.length - 1; i++) {
      const current = experiences[i];
      const next = experiences[i + 1];
      const currentEnd = current.endDate ? new Date(current.endDate) : null;
      if (!currentEnd) continue; // current job – no gap
      const nextStart = new Date(next.startDate);
      const gapMs = nextStart.getTime() - currentEnd.getTime();
      if (gapMs > SIX_MONTHS_MS) {
        const gapMonths = Math.round(gapMs / (30 * 24 * 60 * 60 * 1000));
        issues.push({
          type: 'employment_gap',
          severity: 'medium',
          message: `${gapMonths}-month employment gap detected between "${current.position} at ${current.company}" and "${next.position} at ${next.company}".`,
          details: {
            gapMonths,
            fromExperience: { id: current.id, position: current.position, company: current.company, endDate: current.endDate },
            toExperience: { id: next.id, position: next.position, company: next.company, startDate: next.startDate },
          },
        });
      }
    }

    return issues;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Attribute Inference
  // ──────────────────────────────────────────────────────────────────────────

  inferRelatedAttributes(profile: any): Record<string, { value: string; confidence: number; source: string }> {
    const inferred: Record<string, { value: string; confidence: number; source: string }> = {};

    // 1. Infer preferredLocation from latest experience location
    const sortedExperiences = (profile.experiences ?? []).sort(
      (a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
    );
    if (sortedExperiences.length > 0 && sortedExperiences[0].location) {
      inferred.preferredLocation = {
        value: sortedExperiences[0].location,
        confidence: sortedExperiences[0].isCurrent ? 0.9 : 0.7,
        source: `Latest experience: ${sortedExperiences[0].position} at ${sortedExperiences[0].company}`,
      };
    }

    // 2. Infer headline from latest position + company
    if (sortedExperiences.length > 0) {
      const latest = sortedExperiences[0];
      inferred.headline = {
        value: `${latest.position} at ${latest.company}`,
        confidence: latest.isCurrent ? 0.85 : 0.6,
        source: `Latest experience: ${latest.position} at ${latest.company}`,
      };
    }

    // 3. Infer availability from employment status
    const hasCurrent = sortedExperiences.some((e: any) => e.isCurrent);
    if (hasCurrent) {
      inferred.availability = {
        value: 'Currently Employed',
        confidence: 0.95,
        source: 'Active employment detected',
      };
    } else if (sortedExperiences.length > 0) {
      const latestEnd = sortedExperiences[0].endDate ? new Date(sortedExperiences[0].endDate) : null;
      if (latestEnd) {
        const monthsSinceEnd = Math.round(
          (Date.now() - latestEnd.getTime()) / (30 * 24 * 60 * 60 * 1000),
        );
        inferred.availability = {
          value: monthsSinceEnd <= 3 ? 'Open to Opportunities' : 'Actively Seeking',
          confidence: monthsSinceEnd <= 3 ? 0.75 : 0.85,
          source: `Last position ended ${monthsSinceEnd} month(s) ago`,
        };
      }
    } else {
      inferred.availability = {
        value: 'Open to Opportunities',
        confidence: 0.5,
        source: 'No employment history found',
      };
    }

    return inferred;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Shareable Subset (Privacy-Scoped)
  // ──────────────────────────────────────────────────────────────────────────

  getShareableSubset(profile: any, requestedScopes: string[]): ShareableProfile {
    const data: Record<string, any> = {};

    const scopeMap: Record<string, () => void> = {
      'profile:basic': () => {
        data.name = profile.user?.name;
        data.headline = profile.headline;
        data.bio = profile.bio;
        data.location = profile.location;
      },
      'profile:contact': () => {
        data.email = profile.user?.email;
        data.phone = profile.user?.phone;
        data.websiteUrl = profile.websiteUrl;
      },
      'profile:social': () => {
        data.githubUrl = profile.githubUrl;
        data.linkedinUrl = profile.linkedinUrl;
        data.websiteUrl = profile.websiteUrl;
      },
      'profile:experience': () => {
        data.experiences = (profile.experiences ?? []).map((e: any) => ({
          company: e.company,
          position: e.position,
          location: e.location,
          startDate: e.startDate,
          endDate: e.endDate,
          isCurrent: e.isCurrent,
          type: e.type,
          description: e.description,
        }));
      },
      'profile:education': () => {
        data.educations = (profile.educations ?? []).map((e: any) => ({
          school: e.school,
          degree: e.degree,
          fieldOfStudy: e.fieldOfStudy,
          startDate: e.startDate,
          endDate: e.endDate,
          grade: e.grade,
        }));
      },
      'profile:skills': () => {
        data.skills = (profile.skills ?? []).map((s: any) => ({
          name: s.name,
          level: s.level,
          category: s.category,
        }));
      },
      'profile:projects': () => {
        data.projects = (profile.projects ?? []).map((p: any) => ({
          title: p.title,
          description: p.description,
          url: p.url,
          technologies: p.technologies,
        }));
      },
      'profile:certifications': () => {
        data.certifications = (profile.certifications ?? []).map((c: any) => ({
          name: c.name,
          issuer: c.issuer,
          issueDate: c.issueDate,
          credentialUrl: c.credentialUrl,
        }));
      },
      'profile:awards': () => {
        data.awards = (profile.awards ?? []).map((a: any) => ({
          title: a.title,
          issuer: a.issuer,
          date: a.date,
          description: a.description,
        }));
      },
      'profile:languages': () => {
        data.languages = (profile.languages ?? []).map((l: any) => ({
          name: l.name,
          proficiency: l.proficiency,
        }));
      },
    };

    const grantedScopes: string[] = [];
    for (const scope of requestedScopes) {
      const handler = scopeMap[scope];
      if (handler) {
        handler();
        grantedScopes.push(scope);
      }
    }

    return {
      scopes: grantedScopes,
      data,
      generatedAt: new Date().toISOString(),
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  private _scoreFields(
    fields: { key: string; label: string; value: any }[],
    weight: number,
    categoryName: string,
  ): { category: ProfileStrengthCategory; suggestions: string[] } {
    const present = fields.filter((f) => f.value && String(f.value).trim().length > 0);
    const percentage = fields.length > 0 ? +(present.length / fields.length * 100).toFixed(0) : 0;
    const score = +(percentage / 100 * weight).toFixed(1);
    const missing = fields.filter((f) => !f.value || String(f.value).trim().length === 0).map((f) => f.label);
    const suggestions: string[] = [];

    if (missing.length > 0) {
      suggestions.push(`Add ${missing.join(', ').toLowerCase()} to improve your ${categoryName.toLowerCase()} section.`);
    }

    return {
      category: { category: categoryName, weight, score, maxScore: weight, percentage, missing },
      suggestions,
    };
  }
}
