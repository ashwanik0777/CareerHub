export interface OptimizationRecommendation {
  category: 'MEASURABLE_METRICS' | 'KEYWORDS' | 'READABILITY';
  currentText: string;
  recommendedText: string;
  rationale: string;
}

export interface AtsAnalysisReport {
  overallScore: number;
  categories: {
    category: string;
    score: number;
    rationale: string;
    fixes: string[];
  }[];
}

export interface AiServiceAdapter {
  optimizeResume(resumeText: string, targetRole?: string): Promise<OptimizationRecommendation[]>;
  analyzeAts(resumeText: string, jobDescription?: string): Promise<AtsAnalysisReport>;
  generateCoverLetter(profileData: any, jobDescription: string, tone?: string): Promise<string>;
  matchJob(profileData: any, jobDescription: string): Promise<{ score: number; alignment: string[]; gaps: string[]; eligibility: string }>;
}

/**
 * High-fidelity Mock AI service adapter implementation.
 * Swappable with Gemini or OpenAI adapters.
 */
export class MockAiAdapter implements AiServiceAdapter {
  async optimizeResume(_resumeText: string, targetRole?: string): Promise<OptimizationRecommendation[]> {
    return [
      {
        category: 'MEASURABLE_METRICS',
        currentText: 'Worked on backend services and improved database queries.',
        recommendedText: 'Architected high-throughput backend services and optimized PostgreSQL query indexing, reducing query latencies by 38% and supporting 12k monthly active users.',
        rationale: 'Adding specific metrics and numbers significantly increases recruiter trust and validates your achievements.',
      },
      {
        category: 'KEYWORDS',
        currentText: 'Responsible for server management and coding.',
        recommendedText: 'Managed Kubernetes clusters and microservices deployments via CI/CD pipelines, utilizing TypeScript, Next.js, and Node.js.',
        rationale: `Targeting specific, modern technical keywords increases search match rankings in recruitment filters for ${targetRole || 'Software Engineering'} roles.`,
      },
      {
        category: 'READABILITY',
        currentText: 'I did a lot of things including frontend development, fixing bugs, attending meetings, writing documentations, and managing tasks.',
        recommendedText: 'Led cross-functional sprint planning, authored core design specifications, and executed features across client-facing applications.',
        rationale: 'Active action verbs improve scanning speed for human reviewers.',
      }
    ];
  }

  async analyzeAts(_resumeText: string, _jobDescription?: string): Promise<AtsAnalysisReport> {
    return {
      overallScore: 78,
      categories: [
        {
          category: 'FORMATTING',
          score: 85,
          rationale: 'Single-column clean structure detected. Standard margins are present.',
          fixes: ['Ensure all headers use standard sizing.', 'Avoid using tables or custom visual lines which confuse ATS parsers.']
        },
        {
          category: 'KEYWORDS',
          score: 68,
          rationale: 'Strong general keywords, but missing domain-specific targets matching the job description.',
          fixes: ['Add mentions of Docker, CI/CD pipelines, and JWT authentication.', 'Include Cloud hosting credentials.']
        },
        {
          category: 'SECTION_COMPLETENESS',
          score: 95,
          rationale: 'Contains clear Experience, Education, Projects, and Skills boundaries.',
          fixes: []
        },
        {
          category: 'SKILL_REPRESENTATION',
          score: 70,
          rationale: 'Skills are grouped broadly but lack level descriptions or categorical hierarchies.',
          fixes: ['Group technical skills explicitly by category (Languages, Databases, Frameworks).']
        },
        {
          category: 'READABILITY',
          score: 72,
          rationale: 'Bullet points contain too many passive terms and subjective descriptions.',
          fixes: ['Replace helper words (helped, assisted) with direct action terms (spearheaded, designed).']
        }
      ]
    };
  }

  async generateCoverLetter(profileData: any, jobDescription: string, _tone = 'professional'): Promise<string> {
    const name = profileData.user?.name || 'Applicant';
    const headline = profileData.headline || 'Software Engineer';
    const companyMatch = jobDescription.match(/at\s+([A-Z][a-zA-Z0-9\s]+)/i);
    const company = companyMatch && companyMatch[1] ? companyMatch[1].trim() : 'your company';

    return `Dear Hiring Team at ${company},

I am writing to express my strong interest in the opportunity to join your team. As a ${headline} with a passion for building robust, scalable applications, I believe my professional experience and technical skills align closely with the requirements of this role.

In my current profile, I have maintained high standards of code quality and architectural integrity. My technical toolkit includes modern frontend frameworks, backend systems, and database management, which enables me to contribute across the entire product lifecycle. I take pride in engineering efficient systems that deliver premium user experiences.

I am particularly drawn to this opportunity because it demands an engineer who values clean design, structured data workflows, and modern development cycles. I am eager to bring my background in system design and product optimization to your engineering team.

Thank you for your time and consideration. I look forward to discussing how my experience can contribute to your goals.

Sincerely,
${name}`;
  }

  async matchJob(profileData: any, jobDescription: string): Promise<{ score: number; alignment: string[]; gaps: string[]; eligibility: string }> {
    const profileSkills = (profileData.skills || []).map((s: any) => s.name.toLowerCase());
    
    const jdKeywords = ['react', 'next.js', 'typescript', 'postgres', 'docker', 'graphql', 'node.js', 'aws'];
    const matched: string[] = [];
    const missing: string[] = [];

    jdKeywords.forEach(skill => {
      if (profileSkills.includes(skill) || jobDescription.toLowerCase().includes(skill)) {
        if (profileSkills.includes(skill)) {
          matched.push(skill);
        } else {
          missing.push(skill);
        }
      }
    });

    const score = Math.round(40 + (matched.length / (matched.length + missing.length || 1)) * 50);

    return {
      score,
      alignment: matched.map(s => s.toUpperCase()),
      gaps: missing.map(s => s.toUpperCase()),
      eligibility: score >= 70 ? 'HIGH_MATCH' : score >= 50 ? 'MEDIUM_MATCH' : 'LOW_MATCH',
    };
  }
}

/**
 * Central pluggable AI Service class with built-in caching and exponential backoff retry helpers.
 */
export class AiService {
  private adapter: AiServiceAdapter;
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private readonly defaultTtlMs = 10 * 60 * 1000; // 10 minutes cache TTL

  constructor(adapter?: AiServiceAdapter) {
    this.adapter = adapter || new MockAiAdapter();
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.value;
  }

  private setInCache(key: string, value: any): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.defaultTtlMs,
    });
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 300): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries <= 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryWithBackoff(fn, retries - 1, delay * 2);
    }
  }

  async optimizeResume(resumeText: string, targetRole?: string): Promise<OptimizationRecommendation[]> {
    const cacheKey = `opt:${resumeText.substring(0, 100)}:${targetRole || ''}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.retryWithBackoff(() => this.adapter.optimizeResume(resumeText, targetRole));
    this.setInCache(cacheKey, result);
    return result;
  }

  async analyzeAts(resumeText: string, jobDescription?: string): Promise<AtsAnalysisReport> {
    const cacheKey = `ats:${resumeText.substring(0, 100)}:${(jobDescription || '').substring(0, 100)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.retryWithBackoff(() => this.adapter.analyzeAts(resumeText, jobDescription));
    this.setInCache(cacheKey, result);
    return result;
  }

  async generateCoverLetter(profileData: any, jobDescription: string, tone = 'professional'): Promise<string> {
    const cacheKey = `cl:${profileData.userId || 'user'}:${jobDescription.substring(0, 100)}:${tone}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.retryWithBackoff(() => this.adapter.generateCoverLetter(profileData, jobDescription, tone));
    this.setInCache(cacheKey, result);
    return result;
  }

  async matchJob(profileData: any, jobDescription: string): Promise<{ score: number; alignment: string[]; gaps: string[]; eligibility: string }> {
    const cacheKey = `match:${profileData.id || 'profile'}:${jobDescription.substring(0, 100)}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const result = await this.retryWithBackoff(() => this.adapter.matchJob(profileData, jobDescription));
    this.setInCache(cacheKey, result);
    return result;
  }
}

export const aiService = new AiService();
