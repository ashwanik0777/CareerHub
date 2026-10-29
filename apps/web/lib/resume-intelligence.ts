// ────────────────────────────────────────────────────────────────────────────
// Resume Intelligence Service
// Creates scenario-aware profile variants and selects relevant profile
// attributes based on target-role keywords.
// ────────────────────────────────────────────────────────────────────────────

export interface ProfileVariantConfig {
  name: string;
  scenario: string;
  targetRole: string;
  structure: {
    experienceIds: string[];
    projectIds: string[];
    skillIds: string[];
    educationIds: string[];
    certificationIds: string[];
    awardIds: string[];
    summary: string;
    emphasisAreas: string[];
  };
}

export interface RelevantAttributeSelection {
  experienceIds: string[];
  projectIds: string[];
  skillIds: string[];
  educationIds: string[];
  certificationIds: string[];
  awardIds: string[];
}

// Keyword maps per scenario – skills, technologies, and terms that signal relevance
const SCENARIO_KEYWORDS: Record<string, string[]> = {
  internship: [
    'intern', 'internship', 'student', 'co-op', 'trainee', 'junior',
    'academic', 'coursework', 'capstone', 'undergraduate',
  ],
  swe: [
    'software', 'engineer', 'developer', 'programming', 'system design',
    'algorithms', 'data structures', 'testing', 'ci/cd', 'git',
    'java', 'python', 'c++', 'go', 'rust', 'typescript', 'javascript',
  ],
  research: [
    'research', 'publication', 'paper', 'thesis', 'academic', 'lab',
    'experiment', 'hypothesis', 'analysis', 'methodology', 'phd', 'masters',
    'arxiv', 'conference', 'journal', 'peer-review',
  ],
  ai: [
    'machine learning', 'deep learning', 'ai', 'artificial intelligence',
    'neural network', 'nlp', 'natural language', 'computer vision',
    'tensorflow', 'pytorch', 'transformer', 'llm', 'gpt', 'reinforcement learning',
    'model training', 'inference', 'ml ops',
  ],
  data_science: [
    'data science', 'data analysis', 'analytics', 'statistics', 'visualization',
    'pandas', 'numpy', 'sql', 'tableau', 'power bi', 'etl', 'data pipeline',
    'big data', 'spark', 'hadoop', 'data warehouse', 'regression', 'classification',
  ],
  frontend: [
    'frontend', 'front-end', 'ui', 'ux', 'react', 'vue', 'angular', 'svelte',
    'css', 'html', 'tailwind', 'responsive', 'accessibility', 'figma',
    'design system', 'component', 'web', 'browser', 'dom', 'next.js',
  ],
  backend: [
    'backend', 'back-end', 'api', 'rest', 'graphql', 'microservices',
    'database', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
    'node.js', 'express', 'django', 'flask', 'spring', 'grpc', 'serverless',
  ],
  fullstack: [
    'fullstack', 'full-stack', 'full stack', 'react', 'node', 'next.js',
    'api', 'database', 'frontend', 'backend', 'devops', 'ci/cd',
    'typescript', 'javascript', 'css', 'docker', 'deployment',
  ],
};

export class ResumeIntelligence {
  // ──────────────────────────────────────────────────────────────────────────
  // Create Variant
  // ──────────────────────────────────────────────────────────────────────────

  createVariant(profile: any, scenario: string, targetRole: string): ProfileVariantConfig {
    const relevant = this.selectRelevantAttributes(profile, scenario);

    const emphasisAreas = this._getEmphasisAreas(scenario);
    const summary = this._generateSummary(profile, scenario, targetRole);

    return {
      name: `${targetRole} – ${this._scenarioLabel(scenario)}`,
      scenario,
      targetRole,
      structure: {
        ...relevant,
        summary,
        emphasisAreas,
      },
    };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Select Relevant Attributes
  // ──────────────────────────────────────────────────────────────────────────

  selectRelevantAttributes(profile: any, scenario: string): RelevantAttributeSelection {
    const keywords = [
      ...(SCENARIO_KEYWORDS[scenario] ?? []),
      ...(SCENARIO_KEYWORDS.swe ?? []), // SWE keywords are always loosely relevant
    ];

    // Score and rank experiences
    const experienceIds = this._rankByRelevance(
      profile.experiences ?? [],
      keywords,
      (e: any) => `${e.position} ${e.company} ${e.description ?? ''} ${e.type ?? ''}`,
    ).map((e: any) => e.id);

    // Score and rank projects
    const projectIds = this._rankByRelevance(
      profile.projects ?? [],
      keywords,
      (p: any) => `${p.title} ${p.description ?? ''} ${(p.technologies ?? []).join(' ')}`,
    ).map((p: any) => p.id);

    // Score and rank skills
    const skillIds = this._rankByRelevance(
      profile.skills ?? [],
      keywords,
      (s: any) => `${s.name} ${s.category ?? ''}`,
    ).map((s: any) => s.id);

    // Education – always include all (rarely scenario-filtered)
    const educationIds = (profile.educations ?? []).map((e: any) => e.id);

    // Certifications – filter by keyword relevance
    const certificationIds = this._rankByRelevance(
      profile.certifications ?? [],
      keywords,
      (c: any) => `${c.name} ${c.issuer}`,
    ).map((c: any) => c.id);

    // Awards – include all (generally valuable)
    const awardIds = (profile.awards ?? []).map((a: any) => a.id);

    return { experienceIds, projectIds, skillIds, educationIds, certificationIds, awardIds };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Ranks items by how many scenario keywords appear in their text
   * representation. Items with zero relevance are still included but placed last.
   */
  private _rankByRelevance<T>(
    items: T[],
    keywords: string[],
    textExtractor: (item: T) => string,
  ): T[] {
    const scored = items.map((item) => {
      const text = textExtractor(item).toLowerCase();
      const score = keywords.reduce((acc, kw) => acc + (text.includes(kw.toLowerCase()) ? 1 : 0), 0);
      return { item, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.item);
  }

  private _getEmphasisAreas(scenario: string): string[] {
    const map: Record<string, string[]> = {
      internship: ['academic projects', 'coursework', 'extracurriculars', 'skills'],
      swe: ['system design', 'technical skills', 'professional experience'],
      research: ['publications', 'research experience', 'academic background'],
      ai: ['ml projects', 'model development', 'technical papers', 'tools & frameworks'],
      data_science: ['data analysis projects', 'statistical skills', 'visualization'],
      frontend: ['ui/ux projects', 'design tools', 'frontend frameworks'],
      backend: ['api design', 'infrastructure', 'databases', 'scalability'],
      fullstack: ['end-to-end projects', 'deployment', 'diverse technical skills'],
    };
    return map[scenario] ?? ['professional experience', 'technical skills'];
  }

  private _scenarioLabel(scenario: string): string {
    const map: Record<string, string> = {
      internship: 'Internship',
      swe: 'Software Engineering',
      research: 'Research',
      ai: 'AI / Machine Learning',
      data_science: 'Data Science',
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      fullstack: 'Full-Stack Development',
    };
    return map[scenario] ?? scenario;
  }

  private _generateSummary(profile: any, scenario: string, targetRole: string): string {
    const name = profile.user?.name ?? 'Professional';
    const skillNames = (profile.skills ?? []).slice(0, 5).map((s: any) => s.name);
    const expCount = profile.experiences?.length ?? 0;
    const projCount = profile.projects?.length ?? 0;

    const parts: string[] = [];
    parts.push(`${name} is a results-driven professional targeting ${targetRole} opportunities.`);

    if (expCount > 0) {
      const latest = (profile.experiences ?? []).sort(
        (a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      )[0];
      parts.push(`Most recently served as ${latest.position} at ${latest.company}.`);
    }

    if (skillNames.length > 0) {
      parts.push(`Core competencies include ${skillNames.join(', ')}.`);
    }

    if (projCount > 0) {
      parts.push(`Has delivered ${projCount} notable project(s) demonstrating practical expertise.`);
    }

    const scenarioNote: Record<string, string> = {
      internship: 'Eager to apply academic knowledge in a professional setting.',
      swe: 'Passionate about building reliable, scalable software systems.',
      research: 'Driven by intellectual curiosity and rigorous methodology.',
      ai: 'Focused on advancing intelligent systems through cutting-edge ML techniques.',
      data_science: 'Skilled at turning raw data into actionable insights.',
      frontend: 'Committed to crafting beautiful, performant user interfaces.',
      backend: 'Experienced in designing robust APIs and scalable infrastructure.',
      fullstack: 'Equally comfortable across the stack, from pixels to pipelines.',
    };

    if (scenarioNote[scenario]) {
      parts.push(scenarioNote[scenario]);
    }

    return parts.join(' ');
  }
}
