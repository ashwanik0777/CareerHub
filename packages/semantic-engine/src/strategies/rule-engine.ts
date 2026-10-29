// ────────────────────────────────────────────────────────────────────────────
// Rule Engine Strategy — Regex-Based Field Detection
// ────────────────────────────────────────────────────────────────────────────
// The highest-weight strategy in the hybrid ensemble. Uses hand-crafted
// regex patterns to match field attributes against known ontology IDs.
// Pattern priority follows the reliability hierarchy of HTML attributes.
// ────────────────────────────────────────────────────────────────────────────

import { FieldPrediction, ConfidenceLevel, MappingSource } from '@platform/types';
import { FieldDescriptor, MappingStrategy } from '../interfaces';

// ── Pattern Definitions ─────────────────────────────────────────────────────

interface PatternRule {
  attributeId: string;
  pattern: RegExp;
}

/**
 * Curated regex patterns for common recruitment form fields.
 * Each pattern is designed to match the most common label/name/id variations
 * seen across Greenhouse, Lever, Workday, LinkedIn, and Indeed.
 */
const PATTERN_RULES: PatternRule[] = [
  // ── Personal Information ──
  { attributeId: 'personalInfo.firstName', pattern: /\b(first[\s_-]?name|fname|given[\s_-]?name|forename)\b/i },
  { attributeId: 'personalInfo.lastName', pattern: /\b(last[\s_-]?name|lname|surname|family[\s_-]?name)\b/i },
  { attributeId: 'name', pattern: /\b(full[\s_-]?name|candidate[\s_-]?name|applicant[\s_-]?name|your[\s_-]?name|legal[\s_-]?name|complete[\s_-]?name)\b/i },
  { attributeId: 'personalInfo.headline', pattern: /\b(headline|professional[\s_-]?title|current[\s_-]?title|tagline|designation)\b/i },
  { attributeId: 'personalInfo.bio', pattern: /\b(bio|biography|summary|about[\s_-]?me|cover[\s_-]?letter|personal[\s_-]?statement|professional[\s_-]?summary|career[\s_-]?summary|objective|career[\s_-]?objective)\b/i },
  { attributeId: 'personalInfo.location', pattern: /\b(location|city|address|residence|current[\s_-]?location|home[\s_-]?address|mailing[\s_-]?address|street[\s_-]?address|zip[\s_-]?code|postal[\s_-]?code|pincode|country|state|region)\b/i },

  // ── Contact ──
  { attributeId: 'email', pattern: /\b(e[\s_-]?mail|mail[\s_-]?address|email[\s_-]?address|contact[\s_-]?email|email[\s_-]?id)\b/i },
  { attributeId: 'personalInfo.phone', pattern: /\b(phone|telephone|mobile|cell|contact[\s_-]?number|phone[\s_-]?number|mobile[\s_-]?number|tel)\b/i },

  // ── Social Profiles ──
  { attributeId: 'linkedinUrl', pattern: /\b(linkedin)\b/i },
  { attributeId: 'githubUrl', pattern: /\bgithub\b/i },
  { attributeId: 'websiteUrl', pattern: /\b(portfolio|website|personal[\s_-]?site|homepage|blog|personal[\s_-]?website|portfolio[\s_-]?url)\b/i },

  // ── Resume ──
  { attributeId: 'resume_file', pattern: /\b(resume|cv|curriculum[\s_-]?vitae|upload[\s_-]?resume|attach[\s_-]?resume|resume[\s_-]?upload)\b/i },

  // ── Employment ──
  { attributeId: 'experience.company', pattern: /\b(company|employer|organization|organisation|firm|workplace|current[\s_-]?company|current[\s_-]?employer)\b/i },
  { attributeId: 'experience.position', pattern: /\b(position|job[\s_-]?title|role|current[\s_-]?position|current[\s_-]?role)\b/i },

  // ── Education ──
  { attributeId: 'education.school', pattern: /\b(school|university|institution|college|school[\s_-]?name|university[\s_-]?name|alma[\s_-]?mater)\b/i },
  { attributeId: 'education.degree', pattern: /\b(degree|qualification|academic[\s_-]?degree|diploma)\b/i },
  { attributeId: 'education.fieldOfStudy', pattern: /\b(field[\s_-]?of[\s_-]?study|major|specialization|concentration|discipline)\b/i },

  // ── Preferences ──
  { attributeId: 'preference.salary', pattern: /\b(salary|expected[\s_-]?salary|compensation|desired[\s_-]?salary|salary[\s_-]?expectation|ctc|expected[\s_-]?ctc)\b/i },
  { attributeId: 'preference.yearsOfExperience', pattern: /\b(years[\s_-]?of[\s_-]?experience|experience[\s_-]?years|total[\s_-]?experience|yoe|professional[\s_-]?experience)\b/i },

  // ── Identity (EEO) ──
  { attributeId: 'identity.gender', pattern: /\b(gender|sex|gender[\s_-]?identity)\b/i },
  { attributeId: 'identity.veteranStatus', pattern: /\b(veteran|veteran[\s_-]?status|military[\s_-]?service|military[\s_-]?veteran)\b/i },
];

// ── Confidence Mapping ─────────────────────────────────────────────────────

/**
 * Confidence scores based on which field attribute triggered the match.
 * Ordered by empirical reliability of each HTML attribute for semantic intent.
 */
const SOURCE_CONFIDENCE: Record<string, number> = {
  label: 0.92,
  ariaLabel: 0.88,
  name: 0.85,
  id: 0.78,
  placeholder: 0.70,
  title: 0.55,
  nearbyText: 0.55,
  parentSection: 0.55,
  formContext: 0.55,
};

// ── Strategy Implementation ────────────────────────────────────────────────

/**
 * Rule Engine Strategy.
 *
 * Applies curated regex patterns against each field attribute in priority
 * order. The confidence score is determined by which attribute matched,
 * reflecting the empirical reliability hierarchy of HTML attributes.
 */
export class RuleEngineStrategy implements MappingStrategy {
  readonly name = 'rule_engine';
  readonly weight = 0.35;

  analyze(descriptor: FieldDescriptor): FieldPrediction[] {
    const predictions: Map<string, FieldPrediction> = new Map();

    // Field attributes to check, in priority order
    const fieldsToCheck: Array<{ key: string; value: string }> = [
      { key: 'label', value: descriptor.label },
      { key: 'ariaLabel', value: descriptor.ariaLabel },
      { key: 'name', value: descriptor.name },
      { key: 'id', value: descriptor.id },
      { key: 'placeholder', value: descriptor.placeholder },
      { key: 'title', value: descriptor.title },
      { key: 'nearbyText', value: descriptor.nearbyText },
      { key: 'parentSection', value: descriptor.parentSection },
      { key: 'formContext', value: descriptor.formContext },
    ];

    for (const { key, value } of fieldsToCheck) {
      if (!value) continue;

      for (const rule of PATTERN_RULES) {
        if (rule.pattern.test(value)) {
          // Only keep the highest-confidence match per attribute ID
          if (!predictions.has(rule.attributeId)) {
            const confidence = SOURCE_CONFIDENCE[key] || 0.55;
            const confidenceLevel = this.classifyConfidence(confidence);

            predictions.set(rule.attributeId, {
              attributeId: rule.attributeId,
              confidence,
              confidenceLevel,
              source: MappingSource.RULE_ENGINE,
              reasoning: `Rule engine matched pattern for '${rule.attributeId}' in ${key}: "${value}"`,
            });
          }
        }
      }
    }

    // Sort by confidence descending
    return Array.from(predictions.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private classifyConfidence(confidence: number): ConfidenceLevel {
    if (confidence >= 0.85) return ConfidenceLevel.HIGH;
    if (confidence >= 0.60) return ConfidenceLevel.MEDIUM;
    return ConfidenceLevel.LOW;
  }
}
